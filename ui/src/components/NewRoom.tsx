"use client";

import React, { useState } from "react";
import styles from "./NewRoom.module.css";

const NewRoom: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");

  const handleRoomCreation = async () => {
    try {
      const item = window.localStorage.getItem("user");
      let user = item ? JSON.parse(item) : "";
      if (!user) return;

      const url = `http://localhost:8080/rooms/${user?.id}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      // in case of request error
      if (response.status < 200 || response.status > 200) {
        const msg = await response.text();
        alert(`${msg}. \nplease try again!`);
        return;
      }

      // // reload to fetch the newly updated room list
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <div className={styles.container}>
      {open && (
        <input
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            setPhone(value);
          }}
          className={`${styles.base_input} ${styles.input}`}
        />
      )}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className={`${styles.base_input} ${styles.btn} ${styles.new_room_btn}`}
        >
          New Room
        </button>
      ) : (
        <>
          <button
            onClick={handleRoomCreation}
            className={`${styles.base_input} ${styles.btn} ${styles.create_room_btn}`}
          >
            Create
          </button>
          <button
            onClick={() => {
              setPhone("");
              setOpen(false);
            }}
            className={`${styles.base_input} ${styles.btn} ${styles.cancel_btn}`}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default NewRoom;
