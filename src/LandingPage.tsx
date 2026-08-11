import "./LandingPage.css";

function LandingPage({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="landing-page">
      <button
        type="button"
        className="btn-filled landing-page-create"
        onClick={onCreateNew}
      >
        create new
      </button>
    </div>
  );
}

export default LandingPage;
