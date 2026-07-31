import { useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadCloud, Loader2, X, Star, Download, RefreshCw, Crop } from "lucide-react";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Fallback to legacy Supabase storage url if it's a relative path key
  const BUCKET = "product-images";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadOne(file: File, productId?: string): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary configuration (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (productId) {
    formData.append("folder", `products/${productId}`);
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = await res.json();
  return data.secure_url;
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

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;
      setBusy(true);
      const uploaded: string[] = [];
      for (const f of list) {
        try {
          uploaded.push(await uploadOne(f, productId));
        } catch (e: any) {
          toast.error(`Upload failed: ${e.message || e}`);
        }
      }
      setBusy(false);
      if (uploaded.length) {
        await onUploaded(uploaded);
        toast.success(`Uploaded ${uploaded.length} image${uploaded.length > 1 ? "s" : ""}`);
      }
    },
    [productId, onUploaded],
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
        <div className="text-sm font-medium">{label}</div>
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
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

/** Small badge/actions bar for an image tile. */
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
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-xs group">
      <img src={url} alt="" className="aspect-square w-full object-cover" />
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
        {onEdit && (
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
        <a href={url} download target="_blank" rel="noreferrer" className="rounded border border-border px-1.5 py-1 text-[10px] hover:border-primary" title="Download">
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
