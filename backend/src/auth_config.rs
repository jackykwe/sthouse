use serde::Deserialize;

#[derive(Deserialize, Clone)]
pub struct Auth0EnvConfig {
    pub audience: String,
    pub domain: String,
}

impl Auth0EnvConfig {
    pub fn read_from_dot_env() -> Self {
        #[allow(clippy::expect_used)]
        envy::prefixed("AUTH0_")
            .from_env()
            .expect("Supply missing environment variables for Auth0Client via .env file")
    }
}
