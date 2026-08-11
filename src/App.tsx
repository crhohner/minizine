import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./Layout";
import Body from "./Body";
import ImageUpload from "./ImageUpload";
import type { UploadedImage } from "./ImageUpload";
import BookPreview from "./BookPreview";
import ZineSheet from "./ZineSheet";
import OptionsBar from "./OptionsBar";
import { downloadZineSheetPdf } from "./zineLayout";
import { useAuth } from "./AuthContext";
import CreateAccountPage from "./CreateAccountPage";
import ProfilePage from "./ProfilePage";
import LandingPage from "./LandingPage";
import { usePathname, navigate } from "./RouterContext";
import { saveZine, getZine, DEFAULT_ZINE_NAME } from "./lib/zines";
import ZineFooter from "./ZineFooter";

function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [filename, setFilename] = useState(DEFAULT_ZINE_NAME);
  const [zineId, setZineId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { user, loading, profile, profileLoading } = useAuth();
  const pathname = usePathname();
  const editMatch = pathname.match(/^\/edit(?:\/(.+))?$/);
  const routeZineId = editMatch?.[1] ?? null;

  useEffect(() => {
    if (!routeZineId || routeZineId === zineId) return;

    let cancelled = false;
    (async () => {
      const { zine, error } = await getZine(routeZineId);
      if (cancelled) return;
      if (error || !zine) {
        setSaveError(error ?? "zine not found.");
        return;
      }
      setImages(
        zine.pages.map((page) => ({
          id: page.id,
          name: page.name,
          url: page.dataUrl,
          naturalWidth: page.naturalWidth,
          naturalHeight: page.naturalHeight,
          crop: page.crop,
        })),
      );
      setFilename(zine.name);
      setZineId(zine.id);
    })();

    return () => {
      cancelled = true;
    };
  }, [routeZineId, zineId]);

  const isBlankZine =
    filename.trim() === DEFAULT_ZINE_NAME && images.length === 0;

  async function handleSave() {
    if (!user || isBlankZine) return;
    setSaving(true);
    setSaveError(null);
    const { id, error } = await saveZine({
      id: zineId,
      userId: user.id,
      name: filename,
      images,
    });
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    setZineId(id);
  }

  function resetEditor() {
    setZineId(null);
    setImages([]);
    setFilename(DEFAULT_ZINE_NAME);
    setSaveError(null);
  }

  function handleCreateNew() {
    resetEditor();
    navigate("/edit");
  }

  function handleZineDeleted() {
    resetEditor();
    navigate("/edit");
  }

  if (!loading && user && !profileLoading && !profile) {
    return <CreateAccountPage />;
  }

  if (pathname === "/profile") {
    return (
      <Layout>
        <ProfilePage />
      </Layout>
    );
  }

  if (editMatch) {
    return (
      <Layout>
        <OptionsBar
          filename={filename}
          onFilenameChange={setFilename}
          onDownload={() => downloadZineSheetPdf(images, filename)}
          onSave={handleSave}
          saving={saving}
          saveDisabledReason={
            !user
              ? "sign in to save"
              : isBlankZine
                ? "give your minizine a title or a page before saving"
                : null
          }
        />
        {saveError && <p className="options-bar-error">{saveError}</p>}
        <Body>
          <div className="workspace">
            <ImageUpload images={images} setImages={setImages} />
            <div className="preview-column">
              <BookPreview images={images} />
              <ZineSheet images={images} />
            </div>
          </div>
        </Body>
        <ZineFooter zineId={zineId} onDeleted={handleZineDeleted} />
      </Layout>
    );
  }

  return (
    <Layout>
      <LandingPage onCreateNew={handleCreateNew} />
    </Layout>
  );
}

export default App;
