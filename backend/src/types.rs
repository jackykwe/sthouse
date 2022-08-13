// color_eyre has a pub use eyre, so eyre is directly globally accessible as well
pub type CEReport = color_eyre::Report;
pub type CEResult<T, E = CEReport> = color_eyre::Result<T, E>;

pub type HandlerResult = Result<actix_web::HttpResponse, actix_web::Error>;
