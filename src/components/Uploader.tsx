"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { predictImage, type PredictResponse } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/config";
import { IconUpload } from "./Icons";

export default function Uploader({
  onResult,
  externalImageUrl,
}: {
  onResult?: (result: PredictResponse) => void;
  externalImageUrl?: string | null;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    // Debug log for external image passed from history selection
    // This helps diagnose why the image might not appear
    // (e.g., missing URL, CORS, requires auth headers, etc.)
    // eslint-disable-next-line no-console
    console.log("[Uploader] externalImageUrl:", externalImageUrl ?? null);
  }, [externalImageUrl]);

  const email = useMemo(() => localStorage.getItem(STORAGE_KEYS.userEmail) || undefined, []);
  const name = useMemo(() => localStorage.getItem(STORAGE_KEYS.userName) || undefined, []);

  const onDrop = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    setLoading(true);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const result = await predictImage({ file, user_email: email, user_name: name });
      onResult?.(result);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Upload failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [email, name, onResult]);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    onDrop(e.dataTransfer.files);
  }

  function handleBrowse() {
    inputRef.current?.click();
  }

  return (
    <div className="w-full text-black">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? "border-black bg-black/5" : "border-black"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onDrop(e.target.files)}
        />
        <div className="space-y-2">
          <p className="font-medium flex items-center justify-center gap-2"><IconUpload /> Drag and drop an image here</p>
          <p className="text-sm text-black/60">or</p>
          <button
            onClick={handleBrowse}
            className="border border-black rounded px-3 py-2 hover:bg-black/5"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Browse files"}
          </button>
        </div>
      </div>

      {(externalImageUrl || previewUrl) && (
        <div className="mt-4">
          {/* Using native img deliberately to avoid Next Image loader constraints for blob urls */}
          <img
            src={externalImageUrl || previewUrl || ''}
            alt="Preview"
            className="w-full max-h-80 object-contain rounded border border-black"
            onLoad={() => {
              // eslint-disable-next-line no-console
              console.log("[Uploader] preview loaded", externalImageUrl || previewUrl);
            }}
            onError={() => {
              setError("Failed to load image preview");
              // eslint-disable-next-line no-console
              console.error("[Uploader] failed to load preview:", externalImageUrl || previewUrl);
            }}
          />
        </div>
      )}

      {error && <p className="text-sm text-black mt-2 bg-black/10 px-3 py-2 rounded">{error}</p>}
    </div>
  );
}


