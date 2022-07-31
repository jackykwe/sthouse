use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct AppEnvConfig {
    pub dev_mode: bool,
    pub host: String,
    pub port: u16,
    pub client_origin_url: String,
    pub auth0_audience: String,
    pub auth0_domain: String,
}

impl Default for AppEnvConfig {
    fn default() -> Self {
        envy::from_env().expect("Supply missing environment variables via .env file")
    }
}
