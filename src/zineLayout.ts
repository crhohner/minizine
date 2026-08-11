import { jsPDF } from "jspdf";
import type { UploadedImage } from "./ImageUpload";

// Landscape US letter at 100px/inch: 11in x 8.5in, split into a 4x2 grid
// of panels. Each panel is 2.75in x 4.25in, i.e. an 11:17 ratio — matching
// the crop ratio used for every page — so pages tile without distortion.
export const SHEET_WIDTH = 1100;
export const SHEET_HEIGHT = 850;
const COLUMNS = 4;
const ROWS = 2;

interface ZineCell {
  page: number;
  row: number;
  col: number;
  rotate: boolean;
}

// Standard one-sheet 8-page zine fold layout:
// top row (rotated 180deg):    page5 page4 page3 page2
// bottom row (right side up):  page6 page7 page8 page1
const ZINE_LAYOUT: ZineCell[] = [
  { page: 0, row: 1, col: 3, rotate: false },
  { page: 1, row: 0, col: 3, rotate: true },
  { page: 2, row: 0, col: 2, rotate: true },
  { page: 3, row: 0, col: 1, rotate: true },
  { page: 4, row: 0, col: 0, rotate: true },
  { page: 5, row: 1, col: 0, rotate: false },
  { page: 6, row: 1, col: 1, rotate: false },
  { page: 7, row: 1, col: 2, rotate: false },
];

export function drawZineSheet(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  images: UploadedImage[],
  loaded: Map<string, HTMLImageElement>,
) {
  const cellWidth = canvasWidth / COLUMNS;
  const cellHeight = canvasHeight / ROWS;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (const cell of ZINE_LAYOUT) {
    const image = images[cell.page];
    if (!image) continue;

    const element = loaded.get(image.id);
    if (!element) continue;

    const x = cell.col * cellWidth;
    const y = cell.row * cellHeight;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cellWidth, cellHeight);
    ctx.clip();

    if (cell.rotate) {
      ctx.translate(x + cellWidth / 2, y + cellHeight / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(
        element,
        image.crop.x,
        image.crop.y,
        image.crop.width,
        image.crop.height,
        -cellWidth / 2,
        -cellHeight / 2,
        cellWidth,
        cellHeight,
      );
    } else {
      ctx.drawImage(
        element,
        image.crop.x,
        image.crop.y,
        image.crop.width,
        image.crop.height,
        x,
        y,
        cellWidth,
        cellHeight,
      );
    }

    ctx.restore();
  }
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = url;
  });
}

export async function downloadZineSheetPdf(
  images: UploadedImage[],
  filename: string,
) {
  const canvas = document.createElement("canvas");
  canvas.width = SHEET_WIDTH;
  canvas.height = SHEET_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const entries = await Promise.all(
    images.map(
      async (image) => [image.id, await loadImageElement(image.url)] as const,
    ),
  );
  const loaded = new Map(entries);

  drawZineSheet(ctx, canvas.width, canvas.height, images, loaded);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [SHEET_WIDTH, SHEET_HEIGHT],
  });
  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    SHEET_WIDTH,
    SHEET_HEIGHT,
  );
  const safeFilename = (filename.trim() || "my minizine").replace(/\s+/g, "_");
  pdf.save(`${safeFilename}.pdf`);
}
