use actix::*;
use actix_cors::Cors;
use actix_files::Files;
use actix_web::{http, web, App, HttpServer};
use sqlx::postgres::PgPoolOptions;
mod db;
mod models;
mod routes;
mod server;
mod session;
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // loading the database url from .env file
    let database_url = dotenvy::var("PG_URL").expect("DATABASE_URL must be set");

    // Creating a connection pool to the postgresql server
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("couldn't create sqlx connection pool!");

    let server = server::ChatServer::new(pool.clone()).start();

    // applying migrations to our db
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("failed to migrate");

    let server_addr = "127.0.0.1";
    let server_port = 8080;
    let app = HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_origin("http://localhost:8080")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);
        App::new()
            .app_data(web::Data::new(server.clone()))
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .service(web::resource("/").to(routes::index))
            .route("/ws/{user_id}", web::get().to(routes::chat_server))
            .service(routes::create_user)
            .service(routes::get_user_by_id)
            .service(routes::get_user_by_phone)
            .service(routes::get_conversation_by_id)
            .service(routes::get_rooms)
            .service(Files::new("/", "./static"))
    })
    .workers(2)
    .bind((server_addr, server_port))?
    .run();
    println!("Server running at http://{server_addr}:{server_port}/");
    app.await
}

// use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
// struct ScopeState {
//     name: String,
// }

// #[get("/")]
// async fn index() -> impl Responder {
//     HttpResponse::Ok().body("Hello world!")
// }

// async fn scoped_index(state: web::Data<ScopeState>) -> impl Responder {
//     let msg = format!("Hello {}!", state.name);
//     HttpResponse::Ok().body(msg)
// }

// #[get("/health")]
// async fn health() -> impl Responder {
//     "working fine!"
// }

// // this function could be located in a different module
// fn server_scope_cfg(cfg: &mut web::ServiceConfig) {
//     cfg.app_data(web::Data::new(ScopeState {
//         name: String::from("Server Scope"),
//     }))
//     .route("", web::get().to(scoped_index));
// }

// // this function could be located in a different module
// fn ui_scope_cfg(cfg: &mut web::ServiceConfig) {
//     cfg.app_data(web::Data::new(ScopeState {
//         name: String::from("UI Scope"),
//     }))
//     .route("", web::get().to(scoped_index));
// }

// #[actix_web::main]
// async fn main() -> std::io::Result<()> {
//     // http server uses app as an application factory
//     HttpServer::new(move || {
//         // server scope routes
//         let server_scope = web::scope("/server").configure(server_scope_cfg);

//         // ui scope routes
//         let ui_scope = web::scope("/ui").configure(ui_scope_cfg);

//         // actix app instance
//         // used as an application factory by the http server
//         App::new()
//             .service(index)
//             .service(health)
//             .service(server_scope)
//             .service(ui_scope)
//     })
//     .bind(("127.0.0.1", 8080))?
//     .run()
//     .await
// }
