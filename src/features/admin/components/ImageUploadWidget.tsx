"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Loader, AlertTriangle } from "lucide-react";
import {
  getCloudinarySignatureAction,
  saveProductImagesAction,
} from "@/features/admin/actions/imageActions";
import { useToastStore } from "@/features/toast";

const SCRIPT_TIMEOUT_MS = 12000;

interface ImageUploadWidgetProps {
  productId: number | null;
  onImagesUploaded?: () => void;
  existingCount?: number;
}

interface CollectedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export default function ImageUploadWidget({
  productId,
  onImagesUploaded,
  existingCount = 0,
}: ImageUploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const widgetRef = useRef<CloudinaryUploadWidget | null>(null);
  const collectedRef = useRef<CollectedImage[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToastStore((s) => s.toast);

  const remainingSlots = Math.max(0, 10 - existingCount);

  /* ── Cloudinary script injection ── */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const SCRIPT_SRC = "https://upload-widget.cloudinary.com/global/all.js";

    if (window.cloudinary) {
      setScriptLoaded(true);
      return;
    }

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      const handleLoad = () => {
        setScriptLoaded(true);
        setScriptError(false);
      };
      const handleError = () => setScriptError(true);
      existing.addEventListener("load", handleLoad);
      existing.addEventListener("error", handleError);
      return () => {
        existing.removeEventListener("load", handleLoad);
        existing.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      setScriptError(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    script.onerror = () => {
      setScriptError(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ── Timeout fallback ── */
  useEffect(() => {
    if (scriptLoaded) return;

    timeoutRef.current = setTimeout(() => {
      if (!scriptLoaded) {
        setScriptError(true);
      }
    }, SCRIPT_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [scriptLoaded]);

  const handleUploadResult = useCallback(
    async (error: Error | null, result: CloudinaryUploadWidgetResult) => {
      if (error) {
        toast("Error en la subida", "error");
        return;
      }

      if (result.event === "success") {
        collectedRef.current.push({
          url: result.info!.secure_url,
          publicId: result.info!.public_id,
          width: result.info!.width,
          height: result.info!.height,
          format: result.info!.format,
        });
      }

      if (result.event === "queues-end") {
        if (collectedRef.current.length === 0) return;

        setIsUploading(true);

        try {
          if (!productId) {
            toast("Falta el ID del producto", "error");
            return;
          }
          const saveResult = await saveProductImagesAction(
            productId,
            collectedRef.current
          );

          const saveErrorMsg = "error" in saveResult ? saveResult.error : undefined;
          if (saveErrorMsg) {
            toast(saveErrorMsg, "error");
          } else {
            const savedImages = (saveResult as { images: unknown[] }).images;
            toast(
              `${savedImages.length} imagen(es) guardada(s)`,
              "success"
            );
            onImagesUploaded?.();
          }
        } catch (error) {
          console.error("[IMAGE UPLOAD ERROR]", error);
          toast("Error al guardar las imagenes", "error");
        } finally {
          setIsUploading(false);
          collectedRef.current = [];
        }
      }
    },
    [productId, onImagesUploaded, toast]
  );

  const openWidget = useCallback(async () => {
    if (!scriptLoaded) {
      toast(
        "El widget de Cloudinary aún se está cargando. Si el problema persiste, revisá bloqueadores de anuncios o red.",
        "error"
      );
      return;
    }
    if (!productId) {
      toast("Falta el ID del producto", "error");
      return;
    }
    if (remainingSlots <= 0) {
      toast("Ya se alcanzó el máximo de 10 imágenes", "error");
      return;
    }

    try {
      const sigResult = await getCloudinarySignatureAction();

      if ("error" in sigResult) {
        toast(sigResult.error, "error");
        return;
      }

      const { cloudName, apiKey, signature, timestamp } = sigResult;

      const widget = window.cloudinary!.createUploadWidget(
        {
          cloudName,
          apiKey,
          uploadSignature: async (callback: (signature: string) => void, paramsToSign: Record<string, string | number>) => {
            try {
              const res = await getCloudinarySignatureAction(paramsToSign);
              if ("error" in res) {
                toast(res.error, "error");
                return;
              }
              callback(res.signature);
            } catch (error) {
              console.error("[IMAGE UPLOAD ERROR]", error);
              toast("Error al firmar la subida", "error");
            }
          },
          maxFileSize: 2000000,
          resourceType: "image",
          multiple: true,
          maxFiles: remainingSlots,
        },
        handleUploadResult
      );

      widgetRef.current = widget;
      widget.open();
    } catch (error) {
      console.error("[IMAGE UPLOAD ERROR]", error);
      toast("Error al abrir el widget de subida", "error");
    }
  }, [scriptLoaded, productId, remainingSlots, handleUploadResult, toast]);

  if (!productId) return null;

  return (
    <div className="relative">
        {scriptError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 mb-2.5 bg-[rgba(255,60,60,0.08)] border border-[rgba(255,60,60,0.2)] rounded-md text-[0.75rem] text-[#ff5c5c] leading-relaxed" role="alert">
            <AlertTriangle size={14} aria-hidden="true" />
            <span>
              No se pudo cargar el widget de Cloudinary. Verificá tu conexión o
              desactivá bloqueadores de anuncios.
            </span>
          </div>
        )}

        {!scriptLoaded && !scriptError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 mb-2.5 bg-[rgba(0,127,255,0.06)] border border-[rgba(0,127,255,0.15)] rounded-md text-[0.75rem] text-[#6a9fd8]">
            <Loader size={14} className="animate-spin" aria-hidden="true" />
            <span>Cargando widget de subida...</span>
          </div>
        )}

        <button
          type="button"
          className="inline-flex items-center gap-2 px-[28px] py-[11px] bg-gradient-to-br from-[#007fff] to-[#00aaff] border-0 rounded-md text-[#0a0a0a] font-[inherit] text-[0.82rem] font-semibold tracking-[0.8px] uppercase cursor-pointer transition-transform duration-[0.15s] transition-shadow duration-200 transition-opacity duration-200 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(0,127,255,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#00cfff] focus-visible:outline-offset-[3px]"
          onClick={openWidget}
          disabled={!scriptLoaded || isUploading || remainingSlots <= 0}
          aria-busy={isUploading}
        >
          {isUploading ? (
            <>
              <Loader size={16} className="animate-spin" aria-hidden="true" />
              Guardando...
            </>
          ) : (
            <>
              <Upload size={16} aria-hidden="true" />
              Subir imagenes
            </>
          )}
        </button>

        {remainingSlots > 0 && !isUploading && scriptLoaded && (
          <span className="font-mono text-[0.7rem] font-semibold text-[#5a5a5a] tracking-[0.5px] mt-0.5">
            {remainingSlots} {remainingSlots === 1 ? "slot" : "slots"}{" "}
            disponible{remainingSlots === 1 ? "" : "s"}
          </span>
        )}

        {isUploading && (
          <div className="flex items-center justify-center gap-2.5 px-5 py-3.5 mt-3 bg-[rgba(0,127,255,0.06)] border border-[rgba(0,127,255,0.2)] rounded-md text-[0.8rem] font-semibold text-[#007fff] tracking-[0.4px]" role="status" aria-live="polite">
            <Loader size={16} className="animate-spin" aria-hidden="true" />
            Procesando imagenes...
          </div>
        )}
      </div>
  );
}
