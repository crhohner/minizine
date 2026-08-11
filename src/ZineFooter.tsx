import { useState } from "react";
import DeleteZineModal from "./DeleteZineModal";

function ZineFooter({
  zineId,
  onDeleted,
}: {
  zineId: string | null;
  onDeleted: () => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!zineId) return null;

  return (
    <footer className="page-footer">
      <button
        type="button"
        className="btn-outlined page-footer-delete"
        onClick={() => setShowDeleteModal(true)}
      >
        delete minizine
      </button>
      {showDeleteModal && (
        <DeleteZineModal
          zineId={zineId}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            onDeleted();
          }}
        />
      )}
    </footer>
  );
}

export default ZineFooter;
