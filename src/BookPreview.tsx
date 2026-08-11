import { useMemo, useState } from "react";
import type { UploadedImage } from "./ImageUpload";
import { MAX_IMAGES } from "./ImageUpload";
import "./BookPreview.css";

const PAGE_WIDTH = 220;
const PAGE_HEIGHT = Math.round((PAGE_WIDTH * 17) / 11);

function BookPage({
  image,
  pageIndex,
}: {
  image: UploadedImage | undefined;
  pageIndex: number;
}) {
  if (!image) {
    return (
      <div
        className="book-preview-page book-preview-page--blank"
        style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
      >
        <span className="book-preview-page-blank-label">
          page #{pageIndex + 1} blank
        </span>
      </div>
    );
  }

  const scale = PAGE_WIDTH / image.crop.width;

  return (
    <div
      className="book-preview-page"
      style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
    >
      <img
        src={image.url}
        alt={image.name}
        className="book-preview-page-image"
        style={{
          width: image.naturalWidth * scale,
          height: image.naturalHeight * scale,
          left: -image.crop.x * scale,
          top: -image.crop.y * scale,
        }}
      />
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <path d={direction === "left" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"} />
    </svg>
  );
}

function buildSpreads(count: number): number[][] {
  if (count === 0) return [];
  if (count === 1) return [[0]];

  const spreads: number[][] = [[0]];
  let i = 1;
  while (i <= count - 2) {
    if (i + 1 <= count - 2) {
      spreads.push([i, i + 1]);
      i += 2;
    } else {
      spreads.push([i]);
      i += 1;
    }
  }
  spreads.push([count - 1]);
  return spreads;
}

function BookPreview({ images }: { images: UploadedImage[] }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const spreads = useMemo(() => buildSpreads(MAX_IMAGES), []);
  const lastIndex = Math.max(spreads.length - 1, 0);
  const clampedIndex = Math.min(spreadIndex, lastIndex);
  const currentSpread = spreads[clampedIndex] ?? [];

  function goToPrev() {
    setSpreadIndex(Math.max(0, clampedIndex - 1));
  }

  function goToNext() {
    setSpreadIndex(Math.min(lastIndex, clampedIndex + 1));
  }

  return (
    <div className="book-preview">
      <button
        type="button"
        className="book-preview-arrow"
        onClick={goToPrev}
        disabled={clampedIndex === 0}
        aria-label="Previous page"
      >
        <ChevronIcon direction="left" />
      </button>
      <div className="book-preview-pages">
        {currentSpread.map((pageIndex) => (
          <BookPage
            key={images[pageIndex]?.id ?? pageIndex}
            image={images[pageIndex]}
            pageIndex={pageIndex}
          />
        ))}
      </div>
      <button
        type="button"
        className="book-preview-arrow"
        onClick={goToNext}
        disabled={clampedIndex === lastIndex}
        aria-label="Next page"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

export default BookPreview;
