import { useState } from "react";
import Layout from "./Layout";
import Body from "./Body";
import ImageUpload from "./ImageUpload";
import type { UploadedImage } from "./ImageUpload";
import BookPreview from "./BookPreview";
import ZineSheet from "./ZineSheet";
import { downloadZineSheetPdf } from "./zineLayout";

function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [filename, setFilename] = useState("my zine");

  return (
    <Layout
      filename={filename}
      onFilenameChange={setFilename}
      onDownload={() => downloadZineSheetPdf(images, filename)}
    >
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
