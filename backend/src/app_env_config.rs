use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct AppEnvConfig {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub client_origin_url: String,
    pub auth0_audience: String,
    pub auth0_domain: String,
}

impl AppEnvConfig {
    pub fn read_from_dot_env() -> Self {
        #[allow(clippy::expect_used)]
        envy::from_env().expect("Supply missing environment variables via .env file")
    }
}
