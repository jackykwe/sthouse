use std::{collections::HashSet, pin::Pin};

use actix_web::{
    http::{StatusCode, Uri},
    HttpResponse, ResponseError,
};
use actix_web_httpauth::{
    extractors::{bearer::BearerAuth, AuthenticationError},
    headers::www_authenticate::bearer::Bearer,
};
use derive_more::Display;
use jsonwebtoken::{
    decode,
    errors::Error as JWTError,
    jwk::{AlgorithmParameters, JwkSet},
    Algorithm, DecodingKey, Validation,
};
use serde::Deserialize;

use crate::auth_config::Auth0EnvConfig;

// Most of this code is taken from Auth0's code.
// Main logic that uses jsonwebtoken is at the bottom.

#[derive(Deserialize)]
struct UserInfo {
    pub given_name: Option<String>,
    pub name: String, // fallback if given_name is not present
    pub email: String,
}

#[derive(Deserialize)]
pub struct JWTClaims {
    #[serde(rename = "sub")] // appears as "sub" in JWT
    pub auth0_id: String,
    pub permissions: Option<HashSet<String>>,
}

pub struct VerifiedAuthInfo {
    pub jwt_claims: JWTClaims,
    pub given_name: Option<String>,
    pub name: String, // fallback if given_name is not present
    pub email: String,
}

impl VerifiedAuthInfo {
    pub fn has_permissions(&self, required_permissions: &HashSet<String>) -> bool {
        self.jwt_claims
            .permissions
            .as_ref()
            .map_or(false, |permissions| {
                permissions.is_superset(required_permissions)
            })
    }
}

// ResponseError must implement both Debug and Display...
#[derive(Debug, Display)]
enum ClientError {
    #[display(fmt = "missing_bearer")]
    MissingBearer(AuthenticationError<Bearer>),
    #[display(fmt = "decode_error")]
    DecodeError(JWTError),
    #[display(fmt = "validation_error")]
    ValidationError(String),
    #[display(fmt = "unsupported_algorithm")]
    UnsupportedAlgortithm(AlgorithmParameters),
    #[display(fmt = "identification_error")]
    IdentificationError(String),
}

impl ResponseError for ClientError {
    fn error_response(&self) -> HttpResponse {
        match self {
            Self::MissingBearer(_) => HttpResponse::build(self.status_code())
                .json(String::from("Authorization Bearer missing")),
            Self::DecodeError(ref jwt_error) => HttpResponse::build(self.status_code())
                .json(format!("Invalid token: {}", jwt_error)),
            Self::ValidationError(ref msg) => {
                HttpResponse::build(self.status_code()).json(format!("Unable to validate: {}", msg))
            }
            Self::UnsupportedAlgortithm(ref alg) => {
                HttpResponse::build(self.status_code()).json(format!(
                    "Unsupported encryption algortithm: expected RSA; got {:?}",
                    alg
                ))
            }
            &Self::IdentificationError(ref msg) => HttpResponse::build(self.status_code())
                .json(format!("Unable to identify user: {}", msg)),
        }
    }

    fn status_code(&self) -> StatusCode {
        StatusCode::UNAUTHORIZED
    }
}

impl actix_web::FromRequest for VerifiedAuthInfo {
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn std::future::Future<Output = Result<Self, Self::Error>>>>;

    #[allow(clippy::unwrap_used)]
    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let config = req.app_data::<Auth0EnvConfig>().unwrap().clone();
        let extractor = BearerAuth::extract(req);
        // Box::pin is due to from_request's contract. Everything below can use async; above cannot
        Box::pin(async move {
            let credentials = extractor.await.map_err(ClientError::MissingBearer)?;
            let token = credentials.token();
            let header = jsonwebtoken::decode_header(token).map_err(ClientError::DecodeError)?;
            let kid = header.kid.ok_or_else(|| {
                ClientError::ValidationError("kid not found in token header".to_string())
            })?;
            let domain = config.domain.as_str();
            // JSON Web Key Sets
            let jwks: JwkSet = awc::Client::new()
                .get(
                    Uri::builder()
                        .scheme("https")
                        .authority(domain)
                        .path_and_query("/.well-known/jwks.json")
                        .build()
                        .unwrap(),
                )
                .send()
                .await
                .map_err(|send_request_error| {
                    ClientError::ValidationError(send_request_error.to_string())
                })?
                .json()
                .await
                .map_err(|json_payload_error| {
                    ClientError::ValidationError(json_payload_error.to_string())
                })?;
            let jwk = jwks
                .find(&kid)
                .ok_or_else(|| ClientError::ValidationError("No JWK found for kid".to_string()))?;
            match jwk.clone().algorithm {
                AlgorithmParameters::RSA(ref rsa) => {
                    let mut validation = Validation::new(Algorithm::RS256);
                    validation.set_audience(&[config.audience]);
                    validation.set_issuer(&[Uri::builder()
                        .scheme("https")
                        .authority(domain)
                        .path_and_query("/")
                        .build()
                        .unwrap()]);
                    let key = DecodingKey::from_rsa_components(&rsa.n, &rsa.e)
                        .map_err(ClientError::DecodeError)?;
                    let verified_token = decode::<JWTClaims>(token, &key, &validation)
                        .map_err(ClientError::DecodeError)?;

                    let identity: UserInfo = awc::Client::new()
                        .get(
                            Uri::builder()
                                .scheme("https")
                                .authority(domain)
                                .path_and_query("/userinfo")
                                .build()
                                .unwrap(),
                        )
                        .bearer_auth(token)
                        .send()
                        .await
                        .map_err(|send_request_error| {
                            ClientError::IdentificationError(send_request_error.to_string())
                        })?
                        .json()
                        .await
                        .map_err(|json_payload_error| {
                            ClientError::IdentificationError(json_payload_error.to_string())
                        })?;

                    Ok(Self {
                        jwt_claims: verified_token.claims,
                        given_name: identity.given_name,
                        name: identity.name,
                        email: identity.email,
                    })
                }
                algorithm => Err(ClientError::UnsupportedAlgortithm(algorithm).into()),
            }
        })
    }
}
