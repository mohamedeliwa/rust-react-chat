import { useState } from "react";
import styles from "./Login.module.css";
import FormCreateUsername from "./Signup";

interface Props {
  show: boolean;
  setAuth: Function;
}

const Login: React.FC<Props> = ({ show, setAuth }) => {
  const [isShowSigIn, setShowSignIn] = useState(false);
  const showSignIn = () => {
    setShowSignIn((prev) => !prev);
  };

  const FormSignIn = ({ setAuth }: { setAuth: Function }) => {
    const onSignIn = async (e: any) => {
      e.preventDefault();
      let phone = e.target.phone.value;
      if (phone === "") {
        return;
      }
      let res = await signIn({ phone });
      if (res === null) {
        alert("Failed to create account");
        return;
      }
      if (!res.id) {
        alert(`Phone number not found ${phone}`);
        return;
      }
      setAuth(res);
    };
    return (
      <form action="" className={styles.form} onSubmit={onSignIn}>
        <div>
          <label className={styles.label}>Phone</label>
          <input
            required
            type="text"
            name="phone"
            placeholder="+1111..."
            className={styles.input}
          />
        </div>
        <div className={styles.submit}>
          <button type="submit">Submit</button>
        </div>
        <div className={styles.signIn}>
          <p>
            Do not have username? <button onClick={showSignIn}>Create</button>
          </p>
        </div>
      </form>
    );
  };
  return show ? (
    <div className={styles.container}>
      <div className={styles.form_container}>
        <h3 className={styles.title}>
          {isShowSigIn ? "Log in with your phone." : "Create your account."}
        </h3>
        {isShowSigIn ? (
          <FormSignIn setAuth={setAuth} />
        ) : (
          <FormCreateUsername setAuth={setAuth} setShowSignIn={setShowSignIn} />
        )}
      </div>
    </div>
  ) : null;
};

export default Login;

async function signIn({ phone }: { phone: string }) {
  try {
    const url = "http://localhost:8080/users/phone/" + phone;
    let result = await fetch(url);
    return result.json();
  } catch (e) {
    return Promise.reject(e);
  }
}
