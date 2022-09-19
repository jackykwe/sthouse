use serde::{Deserialize, Serialize};

use crate::app_env_config::AppEnvConfig;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageClaims {
    pub iat: i64, // UTC timestamp (seconds)
    pub exp: i64, // UTC timestamp (seconds)
}

impl ImageClaims {
    #[allow(clippy::unwrap_used)]
    pub fn get_token(&self) -> String {
        let aec = AppEnvConfig::read_from_dot_env();
        jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            self,
            &jsonwebtoken::EncodingKey::from_secret(aec.image_token_secret_512b.as_bytes()),
        )
        .unwrap() // no reason this should fail. docs for encode() also uses unwrap().
    }

    pub fn validate_token(token: &str) -> Result<(), String> {
        let aec = AppEnvConfig::read_from_dot_env();

        let mut validation = jsonwebtoken::Validation::default();
        validation.leeway = 0; // don't want the default 60s leeway

        let decode_result = jsonwebtoken::decode::<Self>(
            token,
            &jsonwebtoken::DecodingKey::from_secret(aec.image_token_secret_512b.as_bytes()),
            &validation,
        );
        match decode_result {
            Ok(_) => Ok(()),
            Err(jsonwebtoken_err) => match jsonwebtoken_err.kind() {
                jsonwebtoken::errors::ErrorKind::ExpiredSignature => Err(String::from(
                    "image_token expired: Please refresh the utilities page to get a new one.",
                )),
                _ => Err(String::from("image_token is corrupted")),
            },
        }
    }
}
