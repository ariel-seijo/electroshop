"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Trash2, Loader, Link, AlertTriangle } from "lucide-react";
import { getCloudinarySignatureAction } from "@/features/admin/actions/imageActions";
import { useToastStore } from "@/features/toast";
import styles from "./ThumbnailUploader.module.css";

interface ThumbnailUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
}

export default function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const widgetRef = useRef<CloudinaryUploadWidget | null>(null);
  const toast = useToastStore((s) => s.toast);

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
    };
    script.onerror = () => setScriptError(true);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleResult = useCallback(
    (error: Error | null, result: CloudinaryUploadWidgetResult) => {
      if (error) {
        toast("Error en la subida", "error");
        return;
      }

      if (result.event === "success") {
        const url = result.info!.secure_url;
        setPreviewUrl(url);
      }

      if (result.event === "queues-end") {
        widgetRef.current?.close();
      }

      if (result.event === "close") {
        setIsUploading(false);
      }
    },
    [toast]
  );

  const openWidget = useCallback(async () => {
    if (!scriptLoaded) {
      toast("El widget de Cloudinary aún no se cargó. Reintentá en unos segundos.", "error");
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
          multiple: false,
        },
        handleResult
      );

      widgetRef.current = widget;
      widget.open();
    } catch {
      toast("Error al abrir el widget de subida", "error");
    }
  }, [scriptLoaded, handleResult, toast]);

  function handleRemove() {
    setPreviewUrl("");
    setUrlValue("");
    onChange?.("");
    toast("Miniatura eliminada", "success");
  }

  function handleConfirm() {
    if (previewUrl) {
      onChange?.(previewUrl);
      toast("Miniatura actualizada", "success");
    }
  }

  function handleUrlSubmit() {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    setPreviewUrl(trimmed);
    setShowUrlInput(false);
    onChange?.(trimmed);
    toast("URL de miniatura aplicada", "success");
  }

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUrlSubmit();
    }
  }

  return (
    <div className={styles.wrapper}>
        {previewUrl ? (
          <div className={styles.preview}>
            <img src={previewUrl} alt="Vista previa de la miniatura" />
          </div>
        ) : (
          <div className={styles.preview}>
            <div className={styles.placeholder}>
              <Upload size={24} aria-hidden="true" />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {scriptError && (
            <div className={styles.scriptError} role="alert">
              <AlertTriangle size={12} aria-hidden="true" />
              <span>No se pudo cargar Cloudinary. Verificá tu conexión.</span>
            </div>
          )}

          {!scriptLoaded && !scriptError && (
            <div className={styles.scriptLoading}>
              <Loader size={12} className={styles.spinner} aria-hidden="true" />
              <span>Cargando widget...</span>
            </div>
          )}

          <button
            type="button"
            className={styles.btnUpload}
            onClick={openWidget}
            disabled={!scriptLoaded || isUploading}
          >
            {isUploading ? (
              <>
                <Loader size={14} className={styles.spinner} aria-hidden="true" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={14} aria-hidden="true" />
                Subir
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.btnUpload}
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={isUploading}
          >
            <Link size={14} aria-hidden="true" />
            URL
          </button>

          {previewUrl && (
            <>
              <button
                type="button"
                className={styles.btnUpload}
                onClick={handleConfirm}
                disabled={isUploading}
                style={previewUrl === value ? { opacity: 0.4 } : undefined}
              >
                Aplicar
              </button>
              <button
                type="button"
                className={styles.btnRemove}
                onClick={handleRemove}
                disabled={isUploading}
              >
                <Trash2 size={14} aria-hidden="true" />
                Quitar
              </button>
            </>
          )}
        </div>

        {showUrlInput && (
          <div style={{ marginTop: "10px" }}>
            <input
              type="url"
              className={styles.urlInput}
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              placeholder="https://res.cloudinary.com/..."
              aria-label="URL de la miniatura"
            />
          </div>
        )}
      </div>
  );
}
