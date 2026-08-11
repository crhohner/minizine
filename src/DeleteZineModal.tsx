import { useState } from "react";
import type { FormEvent } from "react";
import { deleteZine } from "./lib/zines";

function DeleteZineModal({
  zineId,
  onClose,
  onDeleted,
}: {
  zineId: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: deleteError } = await deleteZine(zineId);
    if (deleteError) {
      setSubmitting(false);
      setError(deleteError);
      return;
    }
    onDeleted();
  }

  return (
    <div className="crop-modal-backdrop" onClick={onClose}>
      <div
        className="confirm-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="confirm-modal-title">delete minizine</h2>
        <p className="confirm-modal-warning">
          delete this minizine? this cannot be undone.
        </p>
        <form className="confirm-modal-form" onSubmit={handleSubmit}>
          {error && <p className="create-account-error">{error}</p>}
          <div className="crop-modal-actions">
            <button type="submit" className="btn-filled" disabled={submitting}>
              {submitting ? "deleting..." : "delete"}
            </button>
            <button
              type="button"
              className="btn-outlined"
              onClick={onClose}
              disabled={submitting}
            >
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteZineModal;
