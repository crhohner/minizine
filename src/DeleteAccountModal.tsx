import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "./AuthContext";
import { navigate } from "./RouterContext";

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { profile, deleteProfile } = useAuth();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const expectedUsername = profile?.username ?? "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (confirmation !== expectedUsername) {
      setError(`Type "${expectedUsername}" to confirm.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    const { error: deleteError } = await deleteProfile();
    if (deleteError) {
      setSubmitting(false);
      setError(deleteError);
      return;
    }

    navigate("/");
  }

  return (
    <div className="crop-modal-backdrop" onClick={onClose}>
      <div
        className="confirm-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="confirm-modal-title">delete account</h2>
        <p className="confirm-modal-warning">
          this will permanently delete your username and profile. this
          cannot be undone.
        </p>
        <form className="confirm-modal-form" onSubmit={handleSubmit}>
          <label className="create-account-label" htmlFor="delete-confirm">
            type <strong>{expectedUsername}</strong> to confirm
          </label>
          <input
            id="delete-confirm"
            className="create-account-input"
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            autoFocus
            disabled={submitting}
          />
          {error && <p className="create-account-error">{error}</p>}
          <div className="crop-modal-actions">
            <button
              type="button"
              className="btn-outlined"
              onClick={onClose}
              disabled={submitting}
            >
              cancel
            </button>
            <button
              type="submit"
              className="btn-filled"
              disabled={submitting || confirmation.length === 0}
            >
              {submitting ? "deleting..." : "delete account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
