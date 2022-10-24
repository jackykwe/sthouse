use actix_files::NamedFile;
use actix_web::Result;

#[allow(clippy::unused_async)] // TODO stop-gap fix for unexplained error
pub async fn handler_get_how_it_works() -> Result<NamedFile> {
    Ok(NamedFile::open("./static/How-It-Works.pdf")?)
}

#[allow(clippy::unused_async)] // TODO stop-gap fix for unexplained error
pub async fn handler_get_privacy_policy() -> Result<NamedFile> {
    Ok(NamedFile::open("./static/privacy-policy.html")?)
}
