use crate::db;
use crate::models;
use crate::models::CreateRoomDto;
use crate::models::NewRoom;
use crate::server;
use crate::session;
use actix::*;
use actix_files::NamedFile;
use actix_web::{get, post, web, Error, HttpRequest, HttpResponse, Responder};
use actix_web_actors::ws;
use serde_json::json;
use sqlx::Pool;
use sqlx::Postgres;
use std::time::Instant;
use uuid::Uuid;

// TODO, ADD THE NEXTJS BUILD IN THIS PATH
pub async fn index() -> impl Responder {
    NamedFile::open_async("./static/index.html").await.unwrap()
}

pub async fn chat_server(
    user_id: web::Path<Uuid>,
    req: HttpRequest,
    stream: web::Payload,
    pool: web::Data<Pool<Postgres>>,
    srv: web::Data<Addr<server::ChatServer>>,
) -> Result<HttpResponse, Error> {
    ws::start(
        session::WsChatSession {
            id: 0,
            user_id: user_id.to_owned(),
            hb: Instant::now(),
            addr: srv.get_ref().clone(),
            db_pool: pool,
        },
        &req,
        stream,
    )
}

#[post("/users/create")]
pub async fn create_user(
    pool: web::Data<Pool<Postgres>>,
    form: web::Json<models::NewUser>,
) -> Result<HttpResponse, Error> {
    let user = db::insert_new_user(&pool, &form.username, &form.phone).await;

    match user {
        Ok(user) => Ok(HttpResponse::Ok().json(user)),
        Err(err) => {
            let res = HttpResponse::NotFound().body(
                json!({
                    "error": 400,
                    "message": err.to_string()
                })
                .to_string(),
            );
            Ok(res)
        }
    }
}
#[get("/users/{user_id}")]
pub async fn get_user_by_id(
    pool: web::Data<Pool<Postgres>>,
    id: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let user_id = id.to_owned();
    let user = db::find_user_by_uid(&pool, &user_id).await;
    match user {
        Ok(user) => {
            if let Some(user) = user {
                Ok(HttpResponse::Ok().json(user))
            } else {
                let res = HttpResponse::NotFound().body(
                    json!({
                        "error": 404,
                        "message": format!("No user found with id: {id}")
                    })
                    .to_string(),
                );
                Ok(res)
            }
        }
        Err(err) => {
            let res = HttpResponse::NotFound().body(
                json!({
                    "error": 404,
                    "message": err.to_string()
                })
                .to_string(),
            );
            Ok(res)
        }
    }
}
#[get("/conversations/{uid}")]
pub async fn get_conversation_by_id(
    pool: web::Data<Pool<Postgres>>,
    uid: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let room_id = uid.to_owned();
    let conversations = db::get_conversation_by_room_uid(&pool, room_id).await;
    match conversations {
        Ok(conversations) => Ok(HttpResponse::Ok().json(conversations)),
        Err(err) => {
            let res = HttpResponse::NotFound().body(
                json!({
                    "error": 404,
                    "message": err.to_string()
                })
                .to_string(),
            );
            Ok(res)
        }
    }
}
#[get("/users/phone/{user_phone}")]
pub async fn get_user_by_phone(
    pool: web::Data<Pool<Postgres>>,
    phone: web::Path<String>,
) -> Result<HttpResponse, Error> {
    let user_phone = phone.to_string();
    let mut conn = &pool;
    let user = db::find_user_by_phone(&mut conn, user_phone).await;

    match user {
        Ok(user) => match user {
            Some(user) => Ok(HttpResponse::Ok().json(user)),
            None => {
                let res = HttpResponse::NotFound().body(
                    json!({
                        "error": 404,
                        "message": format!("No user found with phone: {}", phone.to_string())
                    })
                    .to_string(),
                );
                Ok(res)
            }
        },
        Err(err) => {
            let res = HttpResponse::NotFound().body(
                json!({
                    "error": 404,
                    "message": err.to_string()
                })
                .to_string(),
            );
            Ok(res)
        }
    }
}
#[get("/rooms")]
pub async fn get_rooms(pool: web::Data<Pool<Postgres>>) -> Result<HttpResponse, Error> {
    let rooms = db::get_all_rooms(&pool).await;

    match rooms {
        Ok(rooms) => Ok(HttpResponse::Ok().json(rooms)),
        Err(err) => {
            let res = HttpResponse::NotFound().body(
                json!({
                    "error": 404,
                    "message": err.to_string(),
                })
                .to_string(),
            );
            Ok(res)
        }
    }
}

#[get("/rooms/{user_id}")]
pub async fn get_rooms_for_user(
    pool: web::Data<Pool<Postgres>>,
    user_id: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let rooms = db::get_rooms_for_user(&pool, &user_id).await;
    match rooms {
        Ok(rooms) => Ok(HttpResponse::Ok().json(rooms)),
        Err(err) => {
            let res = HttpResponse::NotFound().body(
                json!({
                    "error": 404,
                    "message": err.to_string(),
                })
                .to_string(),
            );
            Ok(res)
        }
    }
}

#[post("/rooms/{user_id}")]
pub async fn create_room(
    conn: web::Data<Pool<Postgres>>,
    user_id: web::Path<Uuid>,
    body: web::Json<CreateRoomDto>,
) -> Result<HttpResponse, Error> {
    let body = body.to_owned();
    let user = db::find_user_by_phone(&conn, body.phone.clone()).await;

    match user {
        Ok(user) => match user {
            Some(user) => {
                let room = db::create_room(
                    &conn,
                    NewRoom {
                        name: "room".to_string(),
                        last_message: "".to_string(),
                        participant_ids: format!("{user_id},{}", user.id),
                    },
                )
                .await;
                match room {
                    Ok(room) => Ok(HttpResponse::Ok().json(room)),
                    Err(err) => {
                        let res = HttpResponse::NotFound().body(
                            json!({
                                "error": 400,
                                "message": err.to_string()
                            })
                            .to_string(),
                        );
                        Ok(res)
                    }
                }
            }
            None => {
                let res = HttpResponse::NotFound().body(
                    json!({
                        "error": 404,
                        "message": format!("No user found with phone: {}", body.phone.clone())
                    })
                    .to_string(),
                );
                Ok(res)
            }
        },
        Err(err) => {
            let res = HttpResponse::NotFound().body(
                json!({
                    "error": 404,
                    "message": err.to_string()
                })
                .to_string(),
            );
            Ok(res)
        }
    }
}
