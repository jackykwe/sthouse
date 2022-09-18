use std::{collections::HashSet, io::Write, path::Path, pin::Pin};

use actix_web::{
    http::{StatusCode, Uri},
    web, HttpResponse, ResponseError,
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
use log::info;
use serde::Deserialize;
use sqlx::{Pool, Sqlite};

use crate::{
    auth_config::Auth0EnvConfig,
    db::users::{create_user, get_user},
};

// Most of this code is taken from Auth0's code.
// Main logic that uses jsonwebtoken is at the bottom.

#[derive(Deserialize)]
#[serde(untagged)] // achieves something like a "algebraic union type" with serde deserialisation
enum UserInfo {
    Success {
        name: String,
        email: String,
    },
    /// When rate limited
    /// {
    ///     "error": "access_denied",
    ///     "error_description": "Too Many Requests",
    ///     "error_uri": "https://auth0.com/docs/policies/rate-limits"
    /// }
    Error {
        _error: String,
        error_description: String,
        _error_uri: String,
    },
}

#[derive(Deserialize)]
pub struct JWTClaims {
    #[serde(rename = "sub")] // appears as "sub" in JWT
    pub auth0_id: String,
    pub permissions: Option<HashSet<String>>,
}

pub struct VerifiedAuthInfo {
    pub jwt_claims: JWTClaims,
    pub name: String,
    pub email: String,
}

impl VerifiedAuthInfo {
    pub fn has_this_permission(&self, this_permission: &str) -> bool {
        self.jwt_claims
            .permissions
            .as_ref()
            .map_or(false, |possessed_permissions| {
                possessed_permissions.contains(this_permission)
            })
    }

    // pub fn has_all_of_these_permissions(&self, these_permissions: &HashSet<String>) -> bool {
    //     self.jwt_claims
    //         .permissions
    //         .as_ref()
    //         .map_or(false, |possessed_permissions| {
    //             possessed_permissions.is_superset(these_permissions)
    //         })
    // }

    pub fn has_any_of_these_permissions(&self, these_permissions: &HashSet<String>) -> bool {
        self.jwt_claims
            .permissions
            .as_ref()
            .map_or(false, |possessed_permissions| {
                !possessed_permissions.is_disjoint(these_permissions)
            })
    }
}

// ResponseError must implement both Debug and Display...
#[derive(Debug, Display)]
pub enum ClientError {
    #[display(fmt = "missing_bearer")]
    MissingBearer(AuthenticationError<Bearer>), // Bearer token missing
    #[display(fmt = "decode_error")]
    DecodeError(JWTError), // errors related to JWT decoding
    #[display(fmt = "validation_error")]
    ValidationError(String), // errors related to signature validation (catch-all; fetching /jwks.json)
    #[display(fmt = "unsupported_algorithm")]
    UnsupportedAlgortithm(AlgorithmParameters), // if the JWT was signed by anything other than RS256
    #[display(fmt = "identification_error")]
    IdentificationError(String), // errors related to fetching /userinfo (catch-all)
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
    #[allow(clippy::too_many_lines)]
    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let pool = req.app_data::<web::Data<Pool<Sqlite>>>().unwrap().clone();
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
            // fetch_latest_jwks_json() only if:
            // 1) ./jwks.json doesn't exist
            // 2) ./jwks.json exists but old
            if !Path::new("./jwks.json").exists() {
                info!("Backend is making a request to /.well-known/jwks.json");
                let mut new_cached_file = std::fs::File::create("./jwks.json")?;
                let jwks_response_bytes = awc::Client::new()
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
                    .body()
                    .await
                    .map_err(|payload_error| {
                        ClientError::ValidationError(payload_error.to_string())
                    })?;
                new_cached_file.write_all(&jwks_response_bytes)?;
            }
            let cached_file = std::fs::read_to_string("./jwks.json").unwrap(); // cached_file should be Ok(_) by now
            let mut jwks: JwkSet = serde_json::from_str(&cached_file)
                .map_err(|serde_error| ClientError::ValidationError(serde_error.to_string()))?;
            let jwk_option = jwks.find(&kid);
            let jwk = match jwk_option {
                Some(e) => e,
                None => {
                    // Retry once
                    info!("Backend is making a request to /.well-known/jwks.json");
                    let mut overwritten_cached_file = std::fs::File::create("./jwks.json")?;
                    let jwks_response_bytes = awc::Client::new()
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
                        .body()
                        .await
                        .map_err(|payload_error| {
                            ClientError::ValidationError(payload_error.to_string())
                        })?;
                    overwritten_cached_file.write_all(&jwks_response_bytes)?;
                    let cached_file = std::fs::read_to_string("./jwks.json").unwrap(); // cached_file should be Ok(_) by now
                    jwks = serde_json::from_str(&cached_file).map_err(|serde_error| {
                        ClientError::ValidationError(serde_error.to_string())
                    })?;
                    jwks.find(&kid).ok_or_else(|| {
                        ClientError::ValidationError("No JWK found for kid".to_string())
                    })?
                }
            };
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

                    let user_option = get_user(&pool, verified_token.claims.auth0_id.clone())
                        .await
                        .map_err(actix_web::error::ErrorInternalServerError)?;
                    let user = match user_option {
                        Some(e) => e,
                        None => {
                            info!("Backend is making a request to /userinfo");
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
                            match identity {
                                UserInfo::Success { name, email } => create_user(
                                    &pool,
                                    verified_token.claims.auth0_id.clone(),
                                    name,
                                    email,
                                )
                                .await
                                .map_err(actix_web::error::ErrorInternalServerError)?,
                                UserInfo::Error {
                                    _error: _,
                                    error_description,
                                    _error_uri: _,
                                } => {
                                    return Err(ClientError::IdentificationError(format!(
                                        "Please try again later ({}).",
                                        error_description
                                    ))
                                    .into());
                                }
                            }
                        }
                    };
                    Ok(Self {
                        jwt_claims: verified_token.claims,
                        name: user.display_name,
                        email: user.email,
                    })
                }
                algorithm => Err(ClientError::UnsupportedAlgortithm(algorithm).into()),
            }
        })
    }
}
