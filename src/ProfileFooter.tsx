import { useState } from "react";
import { useAuth } from "./AuthContext";
import DeleteAccountModal from "./DeleteAccountModal";

function ProfileFooter() {
  const { profile } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!profile) return null;

  return (
    <footer className="page-footer">
      <button
        type="button"
        className="btn-outlined page-footer-delete"
        onClick={() => setShowDeleteModal(true)}
      >
        delete account
      </button>
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </footer>
  );
}

export default ProfileFooter;
