import { useAuth } from "./AuthContext";

function AuthWidget() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <button
        type="button"
        className="btn-filled auth-widget-signin"
        onClick={signInWithGoogle}
      >
        sign in with google
      </button>
    );
  }

  return (
    <div className="auth-widget">
      <span className="auth-widget-email">{user.email}</span>
      <button
        type="button"
        className="btn-outlined auth-widget-signout"
        onClick={signOut}
      >
        sign out
      </button>
    </div>
  );
}

export default AuthWidget;
