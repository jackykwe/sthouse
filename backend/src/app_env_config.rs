use serde::Deserialize;

#[derive(Deserialize)]
pub struct AppEnvConfig {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub client_origin_url: String,
    pub resource_access_token_secret_512b: String,
    pub tls_cert_path: String, // relative to backend directory
    pub tls_key_path: String,  // relative to backend directory
}

impl AppEnvConfig {
    pub fn read_from_dot_env() -> Self {
        #[allow(clippy::expect_used)]
        let result: Self =
            envy::from_env().expect("Supply missing environment variables via .env file");
        assert!(
            result.resource_access_token_secret_512b.len() == 64,
            "image_token_secret_512b: expected 512b, got {}",
            result.resource_access_token_secret_512b.len() * 8
        );
        result
    }
}
