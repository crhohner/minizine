import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { listZines } from "./lib/zines";
import type { ZineSummary } from "./lib/zines";
import { Link } from "./router";
import "./SavedZines.css";

const THUMB_WIDTH = 120;
const THUMB_HEIGHT = Math.round((THUMB_WIDTH * 17) / 11);

function SavedZineItem({ zine }: { zine: ZineSummary }) {
  const { firstPage } = zine;
  const scale = firstPage ? THUMB_WIDTH / firstPage.crop.width : 1;

  return (
    <Link to={`/edit/${zine.id}`} className="saved-zine-item">
      <div
        className="saved-zine-thumb"
        style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
      >
        {firstPage ? (
          <img
            src={firstPage.dataUrl}
            alt={firstPage.name}
            className="saved-zine-thumb-image"
            style={{
              width: firstPage.naturalWidth * scale,
              height: firstPage.naturalHeight * scale,
              left: -firstPage.crop.x * scale,
              top: -firstPage.crop.y * scale,
            }}
          />
        ) : (
          <span className="saved-zine-thumb-empty">no pages</span>
        )}
      </div>
      <span className="saved-zine-name">{zine.name}</span>
    </Link>
  );
}

function SavedZines() {
  const { user } = useAuth();
  const [zines, setZines] = useState<ZineSummary[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    let cancelled = false;
    (async () => {
      const { zines: fetched } = await listZines(userId);
      if (cancelled) return;
      setZines(fetched);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!user || zines.length === 0) return null;

  const filteredZines = zines.filter((zine) =>
    zine.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="saved-zines-section">
      <input
        type="text"
        className="create-account-input saved-zines-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="search by title"
        aria-label="Search saved minizines by title"
      />
      {filteredZines.length > 0 ? (
        <div className="saved-zines">
          {filteredZines.map((zine) => (
            <SavedZineItem key={zine.id} zine={zine} />
          ))}
        </div>
      ) : (
        <p className="saved-zines-empty">no minizines found.</p>
      )}
    </div>
  );
}

export default SavedZines;
