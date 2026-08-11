import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "./AuthContext";
import "./CreateAccountPage.css";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

function CreateAccountPage() {
  const { user, createProfile, signOut } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(value: string): string | null {
    if (value.length < 3 || value.length > 20) {
      return "username must be 3-20 characters.";
    }
    if (!USERNAME_PATTERN.test(value)) {
      return "username can only contain letters, numbers, and underscores.";
    }
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validate(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    const { error: submitError } = await createProfile(username);
    setSubmitting(false);
    if (submitError) setError(submitError);
  }

  return (
    <div className="create-account">
      <div className="create-account-box">
        <h1 className="create-account-title">create your account</h1>
        <p className="create-account-subtitle">
          welcome, {user?.email}! choose a username to finish setting up your
          account.
        </p>
        <form className="create-account-form" onSubmit={handleSubmit}>
          <label className="create-account-label" htmlFor="username">
            username
          </label>
          <input
            id="username"
            className="create-account-input"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="choose a unique username"
            autoComplete="off"
            autoFocus
            disabled={submitting}
          />
          {error && <p className="create-account-error">{error}</p>}
          <button
            type="submit"
            className="btn-filled create-account-submit"
            disabled={submitting || username.length === 0}
          >
            {submitting ? "creating..." : "create account"}
          </button>
        </form>
        <button
          type="button"
          className="btn-outlined create-account-signout"
          onClick={signOut}
        >
          sign out
        </button>
      </div>
    </div>
  );
}

export default CreateAccountPage;
