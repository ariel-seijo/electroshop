"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Loader, AlertTriangle } from "lucide-react";
import {
  getCloudinarySignatureAction,
  saveProductImagesAction,
} from "@/features/admin/actions/imageActions";
import { useToastStore } from "@/features/toast";
import styles from "./ImageUploadWidget.module.css";

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
          const saveResult = await saveProductImagesAction(
            productId!,
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
        } catch {
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

      const sigErrorMsg = "error" in sigResult ? sigResult.error : undefined;
      if (sigErrorMsg) {
        toast(sigErrorMsg, "error");
        return;
      }

      const successSig = sigResult as unknown as { cloudName: string; apiKey: string; signature: string; timestamp: string };

      const widget = window.cloudinary!.createUploadWidget(
        {
          cloudName: successSig.cloudName,
          apiKey: successSig.apiKey,
          uploadSignature: async (callback: (signature: string) => void, paramsToSign: Record<string, string | number>) => {
            try {
              const res = await getCloudinarySignatureAction(paramsToSign);
              const resErrorMsg = "error" in res ? res.error : undefined;
              if (resErrorMsg) {
                toast(resErrorMsg, "error");
                return;
              }
              callback((res as { signature: string }).signature);
            } catch {
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
    } catch {
      toast("Error al abrir el widget de subida", "error");
    }
  }, [scriptLoaded, productId, remainingSlots, handleUploadResult, toast]);

  if (!productId) return null;

  return (
    <div className={styles.uploadSection}>
        {scriptError && (
          <div className={styles.scriptError} role="alert">
            <AlertTriangle size={14} aria-hidden="true" />
            <span>
              No se pudo cargar el widget de Cloudinary. Verificá tu conexión o
              desactivá bloqueadores de anuncios.
            </span>
          </div>
        )}

        {!scriptLoaded && !scriptError && (
          <div className={styles.scriptLoading}>
            <Loader size={14} className={styles.spinner} aria-hidden="true" />
            <span>Cargando widget de subida...</span>
          </div>
        )}

        <button
          type="button"
          className={styles.btnUpload}
          onClick={openWidget}
          disabled={!scriptLoaded || isUploading || remainingSlots <= 0}
          aria-busy={isUploading}
        >
          {isUploading ? (
            <>
              <Loader size={16} className={styles.spinner} aria-hidden="true" />
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
          <span className={styles.counter}>
            {remainingSlots} {remainingSlots === 1 ? "slot" : "slots"}{" "}
            disponible{remainingSlots === 1 ? "" : "s"}
          </span>
        )}

        {isUploading && (
          <div className={styles.uploadingOverlay} role="status" aria-live="polite">
            <Loader size={16} className={styles.spinner} aria-hidden="true" />
            Procesando imagenes...
          </div>
        )}
      </div>
  );
}
