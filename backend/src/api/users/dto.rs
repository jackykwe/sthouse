use serde::Serialize;

#[derive(Serialize)]
pub struct UserReadDTO {
    pub id: i64,
    pub display_name: String,
    pub email: String,
}
