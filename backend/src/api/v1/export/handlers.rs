use serde::Deserialize;

#[derive(Deserialize)]
pub struct ExportQuery {
    pub export_token: String,
}
