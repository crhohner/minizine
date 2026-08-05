import { useEffect, useRef, useState } from "react";
import type { UploadedImage } from "./ImageUpload";
import { SHEET_WIDTH, SHEET_HEIGHT, drawZineSheet } from "./zineLayout";

function useLoadedImages(images: UploadedImage[]) {
  const requested = useRef<Set<string>>(new Set());
  const loadedRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    images.forEach((image) => {
      if (requested.current.has(image.id)) return;
      requested.current.add(image.id);

      const element = new Image();
      element.onload = () => {
        loadedRef.current.set(image.id, element);
        setVersion((v) => v + 1);
      };
      element.src = image.url;
    });
  }, [images]);

  return { loadedRef, version };
}

function ZineSheet({ images }: { images: UploadedImage[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loadedRef, version } = useLoadedImages(images);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    drawZineSheet(ctx, canvas.width, canvas.height, images, loadedRef.current);
  }, [images, loadedRef, version]);

  return (
    <div className="zine-sheet">
      <canvas
        ref={canvasRef}
        width={SHEET_WIDTH}
        height={SHEET_HEIGHT}
        className="zine-sheet-canvas"
      />
    </div>
  );
}

export default ZineSheet;
