"use client";

import styles from "./Avatar.module.css";

function getShortName(full_name = "") {
  if (full_name.includes(" ")) {
    const names = full_name.split(" ");
    return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
  }
  return `${full_name.slice(0, 2)}`.toUpperCase();
}

interface Props {
  children: string;
  bgcolor?: string;
}

const Avatar: React.FC<Props> = ({ children, bgcolor = "" }) => {
  return (
    <div className={styles.container} style={{ backgroundColor: bgcolor }}>
      <span className={styles.content}>{getShortName(children)}</span>
    </div>
  );
};

export default Avatar;
