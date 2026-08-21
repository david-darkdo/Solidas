import { useRef, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadCloud, Loader2, X, Star, Download, RefreshCw, Crop, AlertCircle } from "lucide-react";
import { getCloudinarySignatureServer, uploadLargeMediaFileClient, formatCloudinaryUrl } from "@/lib/upload-server";

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return formatCloudinaryUrl(path);
  }
  const BUCKET = "product-images";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Normalizes device photos (e.g. Samsung HEIC / high resolution camera photos)
 * into standard JPEG blobs prior to upload.
 */
async function normalizeFileForUpload(file: File): Promise<File> {
  const isHeic = /heic|heif/i.test(file.name) || /heic|heif/i.test(file.type);
  if (!isHeic && file.type.startsWith("image/") && file.size < 6 * 1024 * 1024) {
    return file;
  }
  try {
    if (typeof window !== "undefined" && "createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      let width = bitmap.width;
      let height = bitmap.height;
      const maxDim = 2560;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
        if (blob) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          return new File([blob], cleanName, { type: "image/jpeg" });
        }
      }
    }
  } catch (e) {
    console.warn("Client-side image normalization notice:", e);
  }
  return file;
}

/**
 * Reusable uploader — supports drag/drop, click, multi-file, and mobile
 * camera/gallery. Calls onUploaded(paths[]) after successful upload.
 */
export function ImageUploader({
  productId,
  multiple = true,
  onUploaded,
  label = "Upload images",
  compact = false,
}: {
  productId?: string;
  multiple?: boolean;
  onUploaded: (paths: string[]) => void | Promise<void>;
  label?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("");

  const getSignatureFn = useServerFn(getCloudinarySignatureServer);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(
        (f) => !f.type || f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(f.name)
      );
      if (list.length === 0) return;
      setBusy(true);
      const uploaded: string[] = [];

      for (let i = 0; i < list.length; i++) {
        const rawFile = list[i];
        try {
          setStatusText(`Normalizing image format (${i + 1}/${list.length})…`);
          const fileToUpload = await normalizeFileForUpload(rawFile);

          setStatusText(`Uploading image (${i + 1}/${list.length})…`);
          const folder = productId ? `products/${productId}` : "products";
          const url = await uploadLargeMediaFileClient({
            file: fileToUpload,
            folder,
            resourceType: "image",
            getSignatureFn,
            onProgress: (pct) => {
              setStatusText(`Uploading image (${i + 1}/${list.length}) ${pct}%…`);
            },
          });
          if (url) {
            uploaded.push(formatCloudinaryUrl(url));
          }
        } catch (e: any) {
          toast.error(`Upload failed: ${e.message || e}`);
        }
      }

      setBusy(false);
      setStatusText("");
      if (uploaded.length) {
        await onUploaded(uploaded);
        toast.success(`Uploaded ${uploaded.length} image${uploaded.length > 1 ? "s" : ""}`);
      }
    },
    [productId, onUploaded, getSignatureFn],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-lg border-2 border-dashed transition ${
        dragging ? "border-primary bg-primary/5" : "border-border bg-background"
      } ${compact ? "p-3" : "p-5"}`}
    >
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        )}
        <div className="text-sm font-medium">{busy ? (statusText || "Uploading…") : label}</div>
        <div className="text-xs text-muted-foreground">
          Drag & drop, or use the buttons below
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary disabled:opacity-50"
          >
            Choose files
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary disabled:opacity-50 md:hidden"
          >
            Take photo
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*,.heic,.heif"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

/** Small badge/actions bar for an image tile with load error handling. */
export function ImageTile({
  url,
  onDelete,
  onEdit,
  onSetPrimary,
  onReplace,
  onRegenerate,
  isPrimary,
  badge,
}: {
  url: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onSetPrimary?: () => void;
  onReplace?: () => void;
  onRegenerate?: () => void;
  isPrimary?: boolean;
  badge?: string;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const formattedUrl = formatCloudinaryUrl(url);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-xs group">
      {loadFailed ? (
        <div className="aspect-square w-full flex flex-col items-center justify-center p-4 bg-muted/30 text-center space-y-2">
          <AlertCircle className="h-6 w-6 text-amber-500" />
          <span className="text-xs font-semibold text-foreground">Image Decode Failure</span>
          <p className="text-[10px] text-muted-foreground">The image format or network request was interrupted.</p>
          {onReplace && (
            <button
              type="button"
              onClick={onReplace}
              className="mt-1 rounded bg-primary px-2.5 py-1 text-[10px] font-bold text-white hover:bg-primary/90"
            >
              Re-select Image
            </button>
          )}
        </div>
      ) : (
        <img
          src={formattedUrl}
          alt=""
          onError={() => setLoadFailed(true)}
          className="aspect-square w-full object-cover"
        />
      )}

      {badge && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white backdrop-blur">
          {badge}
        </span>
      )}
      {isPrimary && (
        <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
          <Star className="h-3 w-3" /> Primary
        </span>
      )}
      <div className="flex flex-wrap items-center gap-1 border-t border-border bg-card/90 p-1.5 backdrop-blur">
        {onEdit && !loadFailed && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition"
            title="Crop & Rotate Photo"
          >
            <Crop className="h-3 w-3" /> Edit Photo
          </button>
        )}
        {onSetPrimary && !isPrimary && (
          <button type="button" onClick={onSetPrimary} className="rounded border border-border px-1.5 py-1 text-[10px] hover:border-primary">
            <Star className="h-3 w-3" />
          </button>
        )}
        {onReplace && (
          <button type="button" onClick={onReplace} className="rounded border border-border px-1.5 py-1 text-[10px] hover:border-primary" title="Replace">
            <RefreshCw className="h-3 w-3" />
          </button>
        )}
        <a href={formattedUrl} download target="_blank" rel="noreferrer" className="rounded border border-border px-1.5 py-1 text-[10px] hover:border-primary" title="Download">
          <Download className="h-3 w-3" />
        </a>
        {onRegenerate && (
          <button type="button" onClick={onRegenerate} className="rounded border border-primary/40 px-1.5 py-1 text-[10px] text-primary hover:bg-primary/10" title="Regenerate">
            <RefreshCw className="h-3 w-3" />
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="ml-auto rounded border border-destructive/40 px-1.5 py-1 text-[10px] text-destructive hover:bg-destructive/10" title="Delete">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
