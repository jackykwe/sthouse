use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserReadDTO {
    pub id: i64,
    pub display_name: String,
    pub email: String,
}
