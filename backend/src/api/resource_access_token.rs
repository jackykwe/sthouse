use jsonwebtoken::Validation;
use serde::{Deserialize, Serialize};

use crate::app_env_config::AppEnvConfig;

#[derive(Debug, Serialize, Deserialize)]
pub struct ResourceAccessClaims {
    pub aud: String,
    pub sub: String,
    pub exp: i64, // UTC timestamp (seconds)
    pub iat: i64, // UTC timestamp (seconds)
}

impl ResourceAccessClaims {
    #[allow(clippy::unwrap_used)]
    pub fn get_token(&self) -> String {
        let aec = AppEnvConfig::read_from_dot_env();
        jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            self,
            &jsonwebtoken::EncodingKey::from_secret(
                aec.resource_access_token_secret_512b.as_bytes(),
            ),
        )
        .unwrap() // no reason this should fail. docs for encode() also uses unwrap().
    }

    #[allow(clippy::unwrap_used)]
    pub fn validate_token(token: &str, intended_aud: &str) -> Result<(), String> {
        let aec = AppEnvConfig::read_from_dot_env();

        let mut validation = jsonwebtoken::Validation::default();
        validation.leeway = 0; // don't want the default 60s leeway
        validation.set_audience(&[intended_aud]);

        let decode_result = jsonwebtoken::decode::<Self>(
            token,
            &jsonwebtoken::DecodingKey::from_secret(
                aec.resource_access_token_secret_512b.as_bytes(),
            ),
            &validation,
        );
        match decode_result {
            Ok(_) => Ok(()),
            Err(jsonwebtoken_err) => match jsonwebtoken_err.kind() {
                jsonwebtoken::errors::ErrorKind::ExpiredSignature => Err(String::from(
                    "token expired: Please refresh the utilities page to get a new one.",
                )),
                jsonwebtoken::errors::ErrorKind::InvalidAudience => {
                    let mut no_validation = Validation::default();
                    no_validation.insecure_disable_signature_validation();
                    let decode_result_forced = jsonwebtoken::decode::<Self>(
                        token,
                        &jsonwebtoken::DecodingKey::from_secret(
                            aec.resource_access_token_secret_512b.as_bytes(),
                        ),
                        &no_validation,
                    ); // results in a error only if token or signature is valid
                    Err(format!(
                        "token misused: attempted to access {}, but token is for {}",
                        intended_aud,
                        // The only way this match branch is run is when InvalidAudience is the only
                        // error caught during validation. Crucially, the signature isn't malformed.
                        // This unwrap() should be safe.
                        decode_result_forced.unwrap().claims.aud
                    ))
                }
                _ => Err(String::from("token corrupted")),
            },
        }
    }
}
