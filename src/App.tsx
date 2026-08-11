import { useState } from "react";
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
import { usePathname } from "./RouterContext";
import { saveZine } from "./lib/zines";
import ZineFooter from "./ZineFooter";

function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [filename, setFilename] = useState("my minizine");
  const [zineId, setZineId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { user, loading, profile, profileLoading } = useAuth();
  const pathname = usePathname();

  async function handleSave() {
    if (!user) return;
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

  function handleZineDeleted() {
    setZineId(null);
    setImages([]);
    setFilename("my minizine");
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

  if (pathname === "/edit") {
    return (
      <Layout>
        <OptionsBar
          filename={filename}
          onFilenameChange={setFilename}
          onDownload={() => downloadZineSheetPdf(images, filename)}
          onSave={handleSave}
          saving={saving}
          saveDisabled={!user}
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
      <LandingPage />
    </Layout>
  );
}

export default App;
