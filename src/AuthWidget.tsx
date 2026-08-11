import { useAuth } from "./AuthContext";
import { Link } from "./router";

function AuthWidget() {
  const { user, loading, profile, signInWithGoogle, signOut } = useAuth();

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
      <Link to="/profile" className="auth-widget-email">
        {profile?.username ?? user.email}
      </Link>
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
