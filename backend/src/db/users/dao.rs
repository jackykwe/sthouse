#[allow(dead_code)]
pub struct UserDAO {
    pub id: i64,
    pub display_name: String, // compound unique
    pub email: String,        // compound unique
}
