import { navigate } from "./RouterContext";

function LandingPage() {
  return (
    <div className="landing-page">
      <button
        type="button"
        className="btn-filled landing-page-create"
        onClick={() => navigate("/edit")}
      >
        create new
      </button>
    </div>
  );
}

export default LandingPage;
