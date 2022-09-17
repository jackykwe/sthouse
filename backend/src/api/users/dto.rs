use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct UserReadDTO {
    pub display_name: String,
    pub email: String,
}

#[derive(Deserialize)]
pub struct UserUpdateDTO {
    pub new_display_name: String,
}
