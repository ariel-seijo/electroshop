"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Loader, Image as ImageIcon, GripVertical } from "lucide-react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  deleteProductImageAction,
} from "@/features/admin/actions/imageActions";
import { useToastStore } from "@/features/toast";
import styles from "./AdminGallery.module.css";

interface GalleryImage {
  id: string;
  url: string;
  format: string;
  width: number;
  height: number;
  _legacy?: boolean;
}

interface AdminGalleryProps {
  images: GalleryImage[];
  onImageDeleted?: () => void;
  onDelete?: (imageId: string) => Promise<void>;
  onReorder?: (ids: string[]) => void;
}

interface SortableImageProps {
  img: GalleryImage;
  isDeleting: boolean;
  onDelete: (imageId: string, isLegacy: boolean) => void;
}

function SortableImage({ img, isDeleting, onDelete }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const isLegacy = img._legacy === true;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.card} role="listitem">
      <button
        type="button"
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para reordenar"
        tabIndex={0}
      >
        <GripVertical size={14} aria-hidden="true" />
      </button>

      <div className={styles.imageWrap}>
        <Image
          src={img.url}
          alt={`Imagen ${img.format} ${img.width}x${img.height}`}
          width={200}
          height={200}
          sizes="200px"
          loading="lazy"
          unoptimized={isLegacy}
        />

        {isDeleting && (
          <div className={styles.deletingOverlay}>
            <Loader size={20} className={styles.spinner} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className={styles.meta}>
        <span className={styles.formatBadge}>
          {isLegacy ? "url" : img.format}
        </span>
        {!isLegacy && (
          <span className={styles.dimensions}>
            {img.width} x {img.height}
          </span>
        )}
      </div>

      <button
        type="button"
        className={styles.btnDelete}
        onClick={() => onDelete(img.id, isLegacy)}
        disabled={isDeleting}
        aria-label={`Eliminar imagen ${img.format}${!isLegacy ? ` ${img.width}x${img.height}` : ""}`}
        aria-busy={isDeleting}
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function AdminGallery({ images, onImageDeleted, onDelete, onReorder }: AdminGalleryProps) {
  const [items, setItems] = useState<GalleryImage[]>(images);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToastStore((s) => s.toast);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Sync items when images are added/removed, but preserve local reorder
  const idFingerprintRef = useRef("");
  useEffect(() => {
    const nextFingerprint = images.map((img) => img.id).join(",");
    if (idFingerprintRef.current !== nextFingerprint) {
      idFingerprintRef.current = nextFingerprint;
      setItems(images);
    }
  }, [images]);

  async function handleDelete(imageId: string, isLegacy: boolean) {
    if (isLegacy && onDelete) {
      setDeletingId(imageId);
      try {
        await onDelete(imageId);
        toast("Imagen removida", "success");
        onImageDeleted?.();
      } catch (err: unknown) {
        toast(
          err instanceof Error ? err.message : "Error al remover la imagen",
          "error"
        );
      } finally {
        setDeletingId(null);
      }
      return;
    }

    setDeletingId(imageId);

    try {
      const result = await deleteProductImageAction(imageId);

      if ("error" in result) {
        toast(result.error, "error");
      } else {
        toast("Imagen eliminada", "success");
        const filtered = items.filter((img) => img.id !== imageId);
        setItems(filtered);
        onReorder?.(filtered.map((img) => img.id));
        onImageDeleted?.();
      }
    } catch {
      toast("Error al eliminar la imagen", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((img) => img.id === active.id);
    const newIndex = items.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered);

    // Defer parent state update to avoid setState-during-render warning
    const ids = reordered.map((img) => img.id);
    setTimeout(() => onReorder?.(ids), 0);
  }

  if (!items || items.length === 0) {
    return (
      <div className={styles.empty}>
        <ImageIcon size={24} aria-hidden="true" />
        <span>Sin imagenes</span>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className={styles.gallery} role="list" aria-label="Galeria de imagenes">
          {items.map((img) => (
            <SortableImage
              key={img.id}
              img={img}
              isDeleting={deletingId === img.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
