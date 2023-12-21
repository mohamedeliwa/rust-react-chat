use crate::{
    db,
    models::{NewConversation, Room},
    session::{ChatMessage, ChatType},
};
use actix::prelude::*;
use rand::{self, rngs::ThreadRng, Rng};
use sqlx::{Pool, Postgres};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "()")]
pub struct Message(pub String);

#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub addr: Recipient<Message>,
    pub user_id: Uuid,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub id: usize,
    pub user_id: Uuid,
}

#[derive(Message)]
#[rtype(result = "Result<Option<Room>, ()>")]
pub struct ClientMessage {
    // the sender session actor id
    // which resembles a ws connection for a client
    pub id: usize,
    // ChatMessage struct converted into json string
    pub msg: String,
    pub room_id: Uuid,
    pub user_id: Uuid,
}

pub struct ListRooms;

impl actix::Message for ListRooms {
    type Result = Vec<String>;
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Join {
    pub id: usize,
    pub name: String,
}

#[derive(Debug)]
pub struct ChatServer {
    sessions: HashMap<usize, Recipient<Message>>,
    // stores a list of active users and their active connections for each client
    users: HashMap<Uuid, HashSet<usize>>,
    rng: ThreadRng,
    db_pool: Pool<Postgres>,
}

impl ChatServer {
    pub fn new(db_pool: Pool<Postgres>) -> ChatServer {
        println!("ChatServer is created");
        let users = HashMap::new();
        Self {
            sessions: HashMap::new(),
            users,
            rng: rand::thread_rng(),
            db_pool,
        }
    }
    // TODO : insert the msg into the database
    // I think this is done through the WsChatSession actor
    fn send_message(&self, room_data: Option<Room>, message: &str, skip_id: usize) {
        println!(
            "ChatServer is sending a msg: {message} to room: {:?} from user {skip_id}",
            room_data
        );

        match room_data {
            Some(room_data) => {
                let participants: Vec<Uuid> = room_data
                    .participant_ids
                    .split(",")
                    .map(|item| Uuid::parse_str(item).ok())
                    .filter(|item| !item.is_none())
                    .map(|item| item.unwrap())
                    .collect();

                for participant in participants {
                    if let Some(sessions) = self.users.get(&participant) {
                        // looping over user's sessions
                        for id in sessions {
                            // skipping the sender actor
                            if *id != skip_id {
                                // getting each client's Receipient actor, to send the msg
                                if let Some(addr) = self.sessions.get(id) {
                                    addr.do_send(Message(message.to_owned()));
                                }
                            }
                        }
                    }
                }
            }
            None => {
                println!("failed to send the message!");
                return;
            }
        };
    }
}
impl Actor for ChatServer {
    type Context = Context<Self>;
}
impl Handler<Connect> for ChatServer {
    type Result = usize;
    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        let id = self.rng.gen::<usize>();
        println!("ChatServer received a Connect msg from {id}");
        self.sessions.insert(id, msg.addr);

        self.users
            // fetch the entry of user_id
            .entry(msg.user_id)
            // if it doesn't exist, insert it with a value of empty hashset
            .or_insert_with(HashSet::new)
            // then insert the session id in the hashset
            .insert(id);
        id
    }
}
impl Handler<Disconnect> for ChatServer {
    type Result = ();
    fn handle(&mut self, msg: Disconnect, _: &mut Self::Context) -> Self::Result {
        println!("ChatServer received a Disconnect msg from: {}", msg.id);
        if self.sessions.remove(&msg.id).is_some() {
            if let Some(sessions) = self.users.get_mut(&msg.user_id) {
                sessions.remove(&msg.id);
            }
        }
    }
}
impl Handler<ClientMessage> for ChatServer {
    type Result = ResponseActFuture<Self, Result<Option<Room>, ()>>;

    fn handle(&mut self, msg: ClientMessage, _ctx: &mut Self::Context) -> Self::Result {
        println!(
            "ChatServer received a msg {} from: {} in room: {}",
            msg.msg, msg.id, msg.room_id
        );
        let room_id = msg.room_id.clone();
        let db_pool = self.db_pool.clone();
        let session_id = msg.id.clone();
        let user_id = msg.user_id.clone();
        let msg_content = msg.msg.clone();
        let msg_content_1 = msg.msg.clone();

        // https://docs.rs/actix/latest/actix/type.ResponseActFuture.html
        // returning a future from an actor message handler
        Box::pin(
            async move {
                // fetching room data from db
                let room_data = db::find_room_by_uid(&db_pool, &room_id).await;

                if let Err(err) = room_data {
                    // fetching room data error
                    println!("failed to send the message!");
                    println!("{}", err.to_string());
                    return None;
                } else if let Some(room_data) = room_data.unwrap() {
                    // checking if the msg sender is a participant in the room
                    if room_data.participant_ids.contains(&user_id.to_string()) {
                        // the sender is a participant in the room

                        // saving the msg in the database
                        let msg_json = serde_json::from_str::<ChatMessage>(&msg_content_1)
                            .expect("couldn't parse the msg");

                        if msg_json.chat_type == ChatType::TEXT {
                            let new_conversation = NewConversation {
                                user_id,
                                room_id,
                                message: msg_json.value.join(""),
                            };
                            let _ = db::insert_new_conversation(&db_pool, new_conversation).await;
                        }

                        // found the room
                        Some(room_data)
                    } else {
                        // the sender is not a participant in the room
                        None
                    }
                } else {
                    // room not found
                    None
                }
            }
            // converts future to ActorFuture
            .into_actor(self)
            .map(move |res, act, _ctx| {
                // Do some computation with actor's state or context
                act.send_message(res.clone(), &msg_content, session_id);
                Ok(res)
            }),
        )
    }
}
// impl Handler<ListRooms> for ChatServer {
//     type Result = MessageResult<ListRooms>;
//     fn handle(&mut self, _: ListRooms, _: &mut Self::Context) -> Self::Result {
//         let mut rooms = vec![];
//         for key in self.rooms.keys() {
//             rooms.push(key.to_owned());
//         }
//         println!("ChatServer received a ListRooms msg with resp: {:?}", rooms);
//         MessageResult(rooms)
//     }
// }

// what is the purpose of this handler ?????
// impl Handler<Join> for ChatServer {
//     type Result = ();
//     fn handle(&mut self, msg: Join, _: &mut Self::Context) -> Self::Result {
//         let Join { id, name } = msg;
//         println!(
//             "ChatServer received a Join msg from: {} with name: {}",
//             id, name
//         );
//         let mut rooms = vec![];
//         for (n, sessions) in &mut self.rooms {
//             if sessions.remove(&id) {
//                 rooms.push(n.to_owned());
//             }
//         }
//         for room in rooms {
//             self.send_message(
//                 &room,
//                 &json!({
//                     "room": room,
//                     "value": vec![format!("Someone disconnect!")],
//                     "chat_type": session::ChatType::DISCONNECT
//                 })
//                 .to_string(),
//                 0,
//             );
//         }
//         self.rooms
//             .entry(name.clone())
//             .or_insert_with(HashSet::new)
//             .insert(id);
//     }
// }
