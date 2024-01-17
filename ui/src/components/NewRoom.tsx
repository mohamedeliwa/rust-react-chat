"use client";

import React, { useState } from "react";
import styles from "./NewRoom.module.css";
import room from "@/api/room";
import useUser from "@/libs/useUser";

const NewRoom: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const { user } = useUser();

  const handleRoomCreation = async () => {
    try {
      if (!user) return;
      await room.create(user?.id, phone);

      // reload to fetch the newly updated room list
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error: any) {
      alert(`${error.message}. \nplease try again!`);
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
