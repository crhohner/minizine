import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ImageCropModal from "./ImageCropModal";
import "./ImageUpload.css";

export const CROP_ASPECT_RATIO = 11 / 17;

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  naturalWidth: number;
  naturalHeight: number;
  crop: CropData;
}

export const MAX_IMAGES = 8;

function getDefaultCrop(naturalWidth: number, naturalHeight: number): CropData {
  const imageRatio = naturalWidth / naturalHeight;
  const width =
    imageRatio > CROP_ASPECT_RATIO ? naturalHeight * CROP_ASPECT_RATIO : naturalWidth;
  const height =
    imageRatio > CROP_ASPECT_RATIO ? naturalHeight : naturalWidth / CROP_ASPECT_RATIO;

  return {
    x: (naturalWidth - width) / 2,
    y: (naturalHeight - height) / 2,
    width,
    height,
  };
}

function loadImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = url;
  });
}

function CancelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M358.625,313.375  c12.5,12.492,12.5,32.758,0,45.25C352.383,364.875,344.188,368,336,368s-16.383-3.125-22.625-9.375L256,301.25l-57.375,57.375  C192.383,364.875,184.188,368,176,368s-16.383-3.125-22.625-9.375c-12.5-12.492-12.5-32.758,0-45.25L210.75,256l-57.375-57.375  c-12.5-12.492-12.5-32.758,0-45.25c12.484-12.5,32.766-12.5,45.25,0L256,210.75l57.375-57.375c12.484-12.5,32.766-12.5,45.25,0  c12.5,12.492,12.5,32.758,0,45.25L301.25,256L358.625,313.375z" />
    </svg>
  );
}

function CropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 2C7.55228 2 8 2.44772 8 3V6H15C16.6569 6 18 7.34315 18 9V16H21C21.5523 16 22 16.4477 22 17C22 17.5523 21.5523 18 21 18H18V21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21V18H9C7.34315 18 6 16.6569 6 15V8H3C2.44772 8 2 7.55228 2 7C2 6.44772 2.44772 6 3 6H6V3C6 2.44772 6.44772 2 7 2ZM8 8V15C8 15.5523 8.44772 16 9 16H16V9C16 8.44772 15.5523 8 15 8H8Z"
      />
    </svg>
  );
}

function ImageRow({
  image,
  onRemove,
  onCrop,
}: {
  image: UploadedImage;
  onRemove: (id: string) => void;
  onCrop: (image: UploadedImage) => void;
}) {
  return (
    <>
      <button
        type="button"
        className="image-upload-remove"
        onClick={() => onRemove(image.id)}
        aria-label={`Remove ${image.name}`}
      >
        <CancelIcon />
      </button>
      <img src={image.url} alt={image.name} className="image-upload-preview" />
      <span className="image-upload-name">{image.name}</span>
      <button
        type="button"
        className="image-upload-crop"
        onClick={() => onCrop(image)}
        aria-label={`Crop ${image.name}`}
      >
        <CropIcon />
      </button>
    </>
  );
}

function SortableImageItem({
  image,
  onRemove,
  onCrop,
}: {
  image: UploadedImage;
  onRemove: (id: string) => void;
  onCrop: (image: UploadedImage) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  return (
    <li
      ref={setNodeRef}
      className="image-upload-item"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <ImageRow image={image} onRemove={onRemove} onCrop={onCrop} />
    </li>
  );
}

function ImageUpload({
  images,
  setImages,
}: {
  images: UploadedImage[];
  setImages: Dispatch<SetStateAction<UploadedImage[]>>;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<UploadedImage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    event.target.value = "";

    const newImages = await Promise.all(
      selectedFiles.map(async (file) => {
        const url = URL.createObjectURL(file);
        const { width, height } = await loadImageSize(url);
        return {
          id: crypto.randomUUID(),
          name: file.name,
          url,
          naturalWidth: width,
          naturalHeight: height,
          crop: getDefaultCrop(width, height),
        };
      }),
    );

    setImages((prev) => [...prev, ...newImages]);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((image) => image.id !== id);
    });
  }

  function saveCrop(id: string, crop: CropData) {
    setImages((prev) =>
      prev.map((image) => (image.id === id ? { ...image, crop } : image)),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const fromIndex = prev.findIndex((image) => image.id === active.id);
      const toIndex = prev.findIndex((image) => image.id === over.id);
      return arrayMove(prev, fromIndex, toIndex);
    });
  }

  const activeImage = images.find((image) => image.id === activeId) ?? null;
  const limitReached = images.length >= MAX_IMAGES;

  return (
    <div className="image-upload">
      <label
        className={
          limitReached
            ? "btn-filled image-upload-trigger image-upload-trigger--disabled"
            : "btn-filled image-upload-trigger"
        }
      >
        choose files
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={limitReached}
          className="image-upload-input"
        />
      </label>
      {images.length === 0 && (
        <p className="image-upload-empty">no files chosen</p>
      )}
      {limitReached && (
        <p className="image-upload-empty">maximum of {MAX_IMAGES} images</p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={images.map((image) => image.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="image-upload-list">
            {images.map((image) => (
              <SortableImageItem
                key={image.id}
                image={image}
                onRemove={removeImage}
                onCrop={setCropTarget}
              />
            ))}
          </ul>
        </SortableContext>
        <DragOverlay>
          {activeImage && (
            <ul className="image-upload-list">
              <li className="image-upload-item image-upload-item--overlay">
                <ImageRow
                  image={activeImage}
                  onRemove={removeImage}
                  onCrop={setCropTarget}
                />
              </li>
            </ul>
          )}
        </DragOverlay>
      </DndContext>
      {cropTarget && (
        <ImageCropModal
          image={cropTarget}
          onSave={saveCrop}
          onClose={() => setCropTarget(null)}
        />
      )}
    </div>
  );
}

export default ImageUpload;
