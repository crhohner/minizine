import { useEffect, useRef } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import type { CropData, UploadedImage } from "./ImageUpload";
import { CROP_ASPECT_RATIO } from "./ImageUpload";

function ImageCropModal({
  image,
  onSave,
  onClose,
}: {
  image: UploadedImage;
  onSave: (id: string, crop: CropData) => void;
  onClose: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const cropper = new Cropper(imgRef.current, {
      aspectRatio: CROP_ASPECT_RATIO,
      viewMode: 1,
      autoCropArea: 1,
      background: false,
      data: image.crop,
    });
    cropperRef.current = cropper;

    return () => {
      cropper.destroy();
      cropperRef.current = null;
    };
  }, [image]);

  function handleSave() {
    const cropper = cropperRef.current;
    if (!cropper) return;

    const data = cropper.getData(true);
    onSave(image.id, {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
    });
    onClose();
  }

  return (
    <div className="crop-modal-backdrop" onClick={onClose}>
      <div
        className="crop-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="crop-modal-canvas">
          <img ref={imgRef} src={image.url} alt={image.name} />
        </div>
        <div className="crop-modal-actions">
          <button type="button" className="btn-outlined" onClick={onClose}>
            cancel
          </button>
          <button type="button" className="btn-filled" onClick={handleSave}>
            save crop
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
