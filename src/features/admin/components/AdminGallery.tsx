"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Loader, Image as ImageIcon, GripVertical } from "lucide-react";
import Image from "next/image";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteProductImageAction } from "@/features/admin/actions/imageActions";
import { useToastStore } from "@/features/toast";

interface GalleryImage { id: string; url: string; format: string; width: number; height: number; _legacy?: boolean; }
interface AdminGalleryProps { images: GalleryImage[]; onImageDeleted?: () => void; onDelete?: (imageId: string) => Promise<void>; onReorder?: (ids: string[]) => void; }
interface SortableImageProps { img: GalleryImage; isDeleting: boolean; onDelete: (imageId: string, isLegacy: boolean) => void; }

function SortableImage({ img, isDeleting, onDelete }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });
  const isLegacy = img._legacy === true;
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, position: "relative", zIndex: isDragging ? 1 : 0 };

  const cardClass = "relative bg-surface-14 border border-[#1a1a1a] rounded-lg overflow-hidden transition-[border-color,box-shadow,opacity] duration-200 hover:border-brand/35 hover:shadow-[0_4px_20px_rgba(0,127,255,0.08)] group";

  return (
    <div ref={setNodeRef} style={style} className={cardClass} role="listitem">
      <button type="button" className="absolute top-1.5 left-1.5 flex items-center justify-center size-7 bg-black/80 border border-white/10 rounded-full text-text-subtle cursor-grab opacity-0 z-[5] transition-[opacity,color,border-color] duration-[150ms] group-hover:opacity-100 group-focus-within:opacity-100 hover:text-accent hover:border-accent/40 active:cursor-grabbing focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" {...attributes} {...listeners} aria-label="Arrastrar para reordenar" tabIndex={0}>
        <GripVertical size={14} aria-hidden="true" />
      </button>

      <div className="relative w-full aspect-square bg-surface-0 overflow-hidden [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-300 group-hover:[&>img]:scale-105">
        <Image src={img.url} alt={`Imagen ${img.format} ${img.width}x${img.height}`} width={200} height={200} sizes="200px" loading="lazy" unoptimized={isLegacy} />
        {isDeleting && <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg"><Loader size={20} className="animate-[spin_0.7s_linear_infinite] text-danger" aria-hidden="true" /></div>}
      </div>

      <div className="flex flex-col gap-1 px-3 py-2.5 border-t border-[#1a1a1a]">
        <span className="inline-flex items-center self-start px-2 py-0.5 bg-brand/10 border border-brand/20 rounded font-mono text-[0.65rem] font-semibold text-brand-hover uppercase tracking-[0.8px]">{isLegacy ? "url" : img.format}</span>
        {!isLegacy && <span className="font-mono text-[0.68rem] text-[#6a6a6a] tracking-[0.4px]">{img.width} x {img.height}</span>}
      </div>

      <button type="button" className="absolute top-1.5 right-1.5 flex items-center justify-center size-7 bg-black/80 border border-danger/25 rounded-full text-danger cursor-pointer opacity-0 transition-[opacity,background,border-color] duration-[150ms] group-hover:opacity-100 group-focus-within:opacity-100 hover:not-disabled:bg-danger/15 hover:not-disabled:border-danger disabled:opacity-50 disabled:cursor-not-allowed focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2" onClick={() => onDelete(img.id, isLegacy)} disabled={isDeleting} aria-label={`Eliminar imagen ${img.format}${!isLegacy ? ` ${img.width}x${img.height}` : ""}`} aria-busy={isDeleting}>
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function AdminGallery({ images, onImageDeleted, onDelete, onReorder }: AdminGalleryProps) {
  const [items, setItems] = useState<GalleryImage[]>(images);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToastStore((s) => s.toast);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const idFingerprintRef = useRef("");

  useEffect(() => {
    const nextFingerprint = images.map((img) => img.id).join(",");
    if (idFingerprintRef.current !== nextFingerprint) { idFingerprintRef.current = nextFingerprint; setItems(images); }
  }, [images]);

  async function handleDelete(imageId: string, isLegacy: boolean) {
    if (isLegacy && onDelete) { setDeletingId(imageId); try { await onDelete(imageId); toast("Imagen removida", "success"); onImageDeleted?.(); } catch (err: unknown) { toast(err instanceof Error ? err.message : "Error al remover la imagen", "error"); } finally { setDeletingId(null); } return; }
    setDeletingId(imageId);
    try { const result = await deleteProductImageAction(imageId); const errorMsg = "error" in result ? result.error : undefined; if (errorMsg) toast(errorMsg, "error"); else { toast("Imagen eliminada", "success"); const filtered = items.filter((img) => img.id !== imageId); setItems(filtered); onReorder?.(filtered.map((img) => img.id)); onImageDeleted?.(); } } catch { toast("Error al eliminar la imagen", "error"); } finally { setDeletingId(null); }
  }

  function handleDragEnd(event: DragEndEvent) { const { active, over } = event; if (!over || active.id === over.id) return; const oldIndex = items.findIndex((img) => img.id === active.id); const newIndex = items.findIndex((img) => img.id === over.id); const reordered = arrayMove(items, oldIndex, newIndex); setItems(reordered); const ids = reordered.map((img) => img.id); setTimeout(() => onReorder?.(ids), 0); }

  if (!items || items.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center gap-2 px-6 py-9 border border-[#1a1a1a] rounded-lg bg-surface-8 text-[#5a5a5a] text-[0.82rem]">
        <ImageIcon size={24} aria-hidden="true" /><span>Sin imagenes</span>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3" role="list" aria-label="Galeria de imagenes">
          {items.map((img) => <SortableImage key={img.id} img={img} isDeleting={deletingId === img.id} onDelete={handleDelete} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
