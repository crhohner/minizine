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
import { usePathname } from "./RouterContext";

function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [filename, setFilename] = useState("my zine");
  const { user, loading, profile, profileLoading } = useAuth();
  const pathname = usePathname();

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

  return (
    <Layout>
      <OptionsBar
        filename={filename}
        onFilenameChange={setFilename}
        onDownload={() => downloadZineSheetPdf(images, filename)}
      />
      <Body>
        <div className="workspace">
          <ImageUpload images={images} setImages={setImages} />
          <div className="preview-column">
            <BookPreview images={images} />
            <ZineSheet images={images} />
          </div>
        </div>
      </Body>
    </Layout>
  );
}

export default App;
