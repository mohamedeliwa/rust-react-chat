use crate::models::{Conversation, NewConversation, Room, RoomResponse, User};
use sqlx::{Pool, Postgres};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;
type DbError = Box<dyn std::error::Error + Send + Sync>;

// we’ll set up a query that will implement a simple login feature and enable us to find a user by phone number.
pub async fn find_user_by_phone(
    conn: &Pool<Postgres>,
    user_phone: String,
) -> Result<Option<User>, DbError> {
    match sqlx::query_as::<_, User>("SELECT * FROM users WHERE phone = $1;")
        .bind(user_phone)
        .fetch_one(conn)
        .await
    {
        Ok(user) => {
            println!("user: {:?}", user);
            return Ok(Some(user));
        }
        Err(err) => return Err(Box::new(err)),
    }
}

// finds user by id
pub async fn find_user_by_uid(
    conn: &Pool<Postgres>,
    user_id: &Uuid,
) -> Result<Option<User>, DbError> {
    match sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1;")
        .bind(user_id)
        .fetch_optional(conn)
        .await
    {
        Ok(user) => return Ok(user),
        Err(err) => return Err(Box::new(err)),
    };
}

// Here’s a query for storing a new user who registers for our app.
//  This is also part of our authentication system.
// using user name and phone number.
pub async fn insert_new_user(conn: &Pool<Postgres>, nm: &str, pn: &str) -> Result<User, DbError> {
    match sqlx::query_as::<_, User>(
        "INSERT INTO users (username, phone) VALUES ($1, $2) RETURNING *;",
    )
    .bind(nm)
    .bind(pn)
    .fetch_one(conn)
    .await
    {
        Ok(user) => {
            println!("user: {:?}", user);
            return Ok(user);
        }
        Err(err) => return Err(Box::new(err)),
    }
}

//  inserts new conversations
pub async fn insert_new_conversation(
    conn: &Pool<Postgres>,
    new_conversation: NewConversation,
) -> Result<Conversation, DbError> {
    match sqlx::query_as::<_, Conversation>(
        "INSERT INTO conversations (user_id, room_id, content) VALUES ($1, $2, $3) RETURNING *;",
    )
    .bind(new_conversation.user_id)
    .bind(new_conversation.room_id)
    .bind(new_conversation.message)
    .fetch_one(conn)
    .await
    {
        Ok(new_conversation) => Ok(new_conversation),
        Err(err) => Err(Box::new(err)),
    }
}

// finds room by id
pub async fn find_room_by_uid(
    conn: &Pool<Postgres>,
    room_id: &Uuid,
) -> Result<Option<Room>, DbError> {
    match sqlx::query_as::<_, Room>("SELECT * FROM rooms WHERE id = $1;")
        .bind(room_id)
        .fetch_optional(conn)
        .await
    {
        Ok(room) => return Ok(room),
        Err(err) => return Err(Box::new(err)),
    };
}

pub async fn get_rooms_for_user(
    conn: &Pool<Postgres>,
    user_id: &Uuid,
) -> Result<Vec<RoomResponse>, DbError> {
    let sql = format!(
        "SELECT * FROM rooms WHERE participant_ids LIKE '%{}%';",
        user_id
    );

    match sqlx::query_as::<_, Room>(&sql).fetch_all(conn).await {
        Ok(rooms) => {
            let mut response_rooms: Vec<RoomResponse> = vec![];
            for room in rooms {
                let room_users = get_users_of_a_room(&conn, &room).await.unwrap();

                response_rooms.push(RoomResponse {
                    users: room_users,
                    room,
                });
            }
            Ok(response_rooms)
        }
        Err(err) => Err(Box::new(err)),
    }
}

//  set up a query to fetch all the chat rooms and participants from the database:
pub async fn get_all_rooms(conn: &Pool<Postgres>) -> Result<Vec<RoomResponse>, DbError> {
    let rooms_data: Vec<Room> = sqlx::query_as::<_, Room>("SELECT * FROM rooms;")
        .fetch_all(conn)
        .await
        .expect("Couldn't fetch all rooms list!");

    let mut ids = HashSet::new();
    let mut rooms_map = HashMap::new();
    let data = rooms_data.to_vec();

    for room in &data {
        let user_ids = room
            .participant_ids
            .split(",")
            .into_iter()
            .collect::<Vec<_>>();
        for id in user_ids.to_vec() {
            ids.insert(id.to_string());
        }
        rooms_map.insert(room.id.to_string(), user_ids.to_vec());
    }

    let ids: Vec<String> = ids
        .into_iter()
        .collect::<Vec<_>>()
        .into_iter()
        .map(|id| format!("'{id}'"))
        .collect();

    let sql = format!("SELECT * FROM users WHERE id IN({});", ids.join(", "));
    let users_data: Vec<User> = sqlx::query_as::<_, User>(&sql)
        .fetch_all(conn)
        .await
        .expect("couldn't fetch users' list");

    let users_map: HashMap<String, User> = HashMap::from_iter(
        users_data
            .into_iter()
            .map(|item| (item.id.to_string(), item)),
    );
    let response_rooms = rooms_data
        .into_iter()
        .map(|room| {
            let users = rooms_map
                .get(&room.id.to_string())
                .unwrap()
                .into_iter()
                .map(|id| users_map.get(id.to_owned()).unwrap().clone())
                .collect::<Vec<_>>();
            return RoomResponse { room, users };
        })
        .collect::<Vec<_>>();
    Ok(response_rooms)
}

// get conversations by room id
pub async fn get_conversation_by_room_uid(
    conn: &Pool<Postgres>,
    room_id: Uuid,
) -> Result<Vec<Conversation>, DbError> {
    return match sqlx::query_as::<_, Conversation>(
        "SELECT * FROM conversations WHERE room_id = $1;",
    )
    .bind(room_id)
    .fetch_all(conn)
    .await
    {
        Ok(results) => Ok(results),
        Err(err) => Err(Box::new(err)),
    };
}


pub async fn get_users_of_a_room(conn: &Pool<Postgres>, room: &Room) -> Result<Vec<User>, DbError> {
    let sql = format!(
        "SELECT * FROM users WHERE id IN({});",
        room.participant_ids
            .split(",")
            .map(|id| format!("'{id}'"))
            .collect::<Vec<_>>()
            .join(", ")
    );

    match sqlx::query_as::<_, User>(&sql).fetch_all(conn).await {
        Ok(user) => Ok(user),
        Err(err) => Err(Box::new(err)),
    }
}
