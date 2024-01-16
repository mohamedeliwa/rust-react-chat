import styles from "./Login.module.css";

interface Props {
  setAuth: Function;
  setShowSignIn: Function;
}

const Signup: React.FC<Props> = ({ setAuth, setShowSignIn }) => {
  const showSignIn = () => {
    setShowSignIn((prev: boolean) => !prev);
  };

  const onCreateUsername = async (e: any) => {
    e.preventDefault();
    let username = e.target.username.value;
    let phone = e.target.phone.value;
    if (username === "" || phone === "") {
      return;
    }
    let res = await createAccount({ username, phone });
    if (res === null) {
      alert("Failed to create account");
      return;
    }
    setAuth(res);
  };
  return (
    <form action="" className={styles.form} onSubmit={onCreateUsername}>
      <div className={styles.form_item}>
        <label className={styles.label}>Username</label>
        <input
          required
          type="text"
          name="username"
          placeholder="John Doe"
          className={styles.input}
        />
      </div>
      <div className={styles.form_item}>
        <label className={styles.label}>Phone</label>
        <input
          required
          type="text"
          name="phone"
          placeholder="+1111..."
          className={styles.input}
        />
      </div>
      <div className={`${styles.submit} ${styles.form_item}`}>
        <button type="submit">Submit</button>
      </div>
      <div className={`${styles.signIn} ${styles.form_item}`}>
        <p>
          Already have a username? <button onClick={showSignIn}>Sign In</button>
        </p>
      </div>
    </form>
  );
};

export default Signup;

async function createAccount({
  username,
  phone,
}: {
  username: string;
  phone: string;
}) {
  try {
    const url = "http://localhost:8080/users/create";
    let result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, phone }),
    });
    return result.json();
  } catch (e) {
    return Promise.reject(e);
  }
}
