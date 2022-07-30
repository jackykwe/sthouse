use actix_web::{
    get, guard, http::Method, middleware, post, web, App, HttpResponse, HttpServer, Responder,
};
use serde::Deserialize;
use std::sync::Mutex;

struct AppState {
    app_name: String,
}

impl AppState {
    fn new(app_name: String) -> AppState {
        println!("AppState CREATED {}", &app_name);
        AppState { app_name }
    }
}

struct AppStateMut {
    counter: Mutex<i32>, // necessary to mutate safely across threads
}

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

#[get("/data")]
// the arguments to a handler are extractors (of type impl FromRequest). Actix supports up to 12 of these.
async fn data(data_arg: web::Data<AppState>) -> String {
    let app_name = &data_arg.app_name;
    format!("Hello {app_name}")
}

#[get("/data-mut")]
async fn data_mut(data_arg: web::Data<AppStateMut>) -> String {
    let mut counter = data_arg.counter.lock().unwrap();
    *counter += 1;
    format!("Request number: {counter}")
}

// this function could be located in a different module
fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/test")
            .route(web::get().to(|| HttpResponse::Ok()))
            .route(web::head().to(HttpResponse::MethodNotAllowed)),
    );
}
/// extract path info from "/users/{user_id}/{friend}" url
/// {user_id} - deserialises to a u32
/// {friend} - deserialises to a String
#[get("/users/{user_id}/{friend}")]
async fn user_id_friend(path: web::Path<(u32, String)>) -> actix_web::Result<String> {
    let (user_id, friend) = path.into_inner();
    Ok(format!("Welcome {}, user_id {}!", friend, user_id))
    // Ok(format!("Welcome {}, user_id {}!", path.1, path.0))  // also can hmm..
}

#[derive(Deserialize)]
struct UserInfo {
    user_id: u32,
    friend: String,
}
#[get("/users2/{user_id}/{friend}")]
async fn user2_id_friend(info: web::Path<UserInfo>) -> actix_web::Result<String> {
    Ok(format!(
        "Welcome {}, user_id {}!",
        info.friend, info.user_id
    ))
}

// This handler gets called if the query deserialises into Info successfully, else 400 BAD REQUEST error response is returned
#[get("/users3")]
async fn user3_query(info: web::Query<UserInfo>) -> String {
    format!(
        "Welcome user_id {} and friend {}!",
        info.user_id, info.friend
    )
}

// deserialse UserInfo from request body. It's ok if the actual json object contains more fields, they are ignored.
#[get("/users4")]
async fn user4_json_body(info: web::Json<UserInfo>) -> actix_web::Result<String> {
    Ok(format!(
        "Welcome user_id {} and friend {}!",
        info.user_id, info.friend
    ))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("main CALLED"); // called once per thread
    let counter = web::Data::new(AppStateMut {
        counter: Mutex::new(0),
    });

    // Serves incoming requests using your App as a application factory (body of closure spawned every time a new request comes in). An application instance is constructed from the factory (the closure passed to HttpServer::new) for each thread.
    HttpServer::new(move || {
        println!("Closure body CALLED"); // called once per thread

        let json_config = web::JsonConfig::default()
            .limit(4096)
            .error_handler(|err, _req| {
                // create custom error response
                actix_web::error::InternalError::from_response(
                    err,
                    HttpResponse::Conflict().finish(),
                )
                .into()
            });

        App::new()
            .default_service(web::method(Method::GET).to(HttpResponse::Unauthorized))
            // .default_service(
            //     web::route()
            //         .method(Method::GET)
            //         .to(HttpResponse::Unauthorized),
            // )
            .wrap(middleware::NormalizePath::trim())
            .wrap(middleware::Compress::default())
            .configure(config)
            .app_data(json_config)
            .app_data(web::Data::new(AppState::new(String::from("Actix Web"))))
            .app_data(web::Data::new(AppState::new(String::from("Actix Web 2")))) // if the same state is mentioned more than once, the new ones override the old one. This is created 4 times (4 threads)
            .app_data(counter.clone()) // Actix uses Arc<T> internally
            .service(web::scope("/scoped").service(hello).service(echo)) // preferred method of scoping (/scoped/ and /scoped/echo)
            .service(data)
            .service(hello)
            .service(echo)
            .service(data_mut)
            .service(user_id_friend)
            .service(user2_id_friend)
            .service(user3_query)
            .service(user4_json_body)
            .service(
                web::scope("/guard")
                    .guard(guard::Header("Host", "www.rust-lang.org"))
                    .route("", web::to(|| async { HttpResponse::Ok().body("www") })),
            )
            .service(
                web::scope("/guard")
                    .guard(guard::Header("Host", "users.rust-lang.org"))
                    .route("", web::to(|| async { HttpResponse::Ok().body("user") })),
            )
            .service(
                web::scope("/scope")
                    .configure(config)
                    .route("/index.html", web::get().to(manual_hello)),
            )
            .route("/hey", web::get().to(manual_hello))
    })
    .workers(4) // default: number of CPU cores on your device. Each worker receives a separate application instance. Application state isn't shared (unless you share it with something like AppStateMut).
    .bind(("127.0.0.1", 6060))?
    .run()
    .await
}

// ! Any long-running non-CPU bound functions (IO, database) should be expressed as futures or async functions in handler functions. Async handlers get executed concurrently by worker threads and thus don't block the thread. See https://rust-lang.github.io/async-book/01_getting_started/04_async_await_primer.html.
