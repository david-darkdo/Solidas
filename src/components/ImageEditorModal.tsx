import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RotateCcw,
  RotateCw,
  Crop,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Loader2,
  Square,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CropRect {
  x: number; // percentage (0..100)
  y: number; // percentage (0..100)
  width: number; // percentage (0..100)
  height: number; // percentage (0..100)
}

interface ImageEditorModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (editedImageUrl: string) => Promise<void> | void;
  productId?: string;
}

type AspectRatio = "free" | "1:1" | "4:3" | "16:9";

async function uploadEditedBlob(blob: Blob, productId?: string): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary configuration (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)");
  }

  const file = new File([blob], `edited-photo-${Date.now()}.png`, { type: "image/png" });
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

export function ImageEditorModal({
  isOpen,
  imageUrl,
  onClose,
  onSave,
  productId,
}: ImageEditorModalProps) {
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Crop rectangle in percentages (0..100)
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, width: 80, height: 80 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; crop: CropRect } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loadedImageObj, setLoadedImageObj] = useState<HTMLImageElement | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(true);

  // Fetch image as blob to prevent CORS canvas taint
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    let isMounted = true;
    setLoadingImage(true);

    const loadImage = async () => {
      try {
        let srcToUse = imageUrl;
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          const res = await fetch(imageUrl, { mode: "cors" });
          const blob = await res.blob();
          srcToUse = URL.createObjectURL(blob);
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (isMounted) {
            setLoadedImageObj(img);
            setLoadingImage(false);
          }
        };
        img.onerror = () => {
          if (isMounted) {
            // Fallback load direct
            const fallbackImg = new Image();
            fallbackImg.src = imageUrl;
            fallbackImg.onload = () => {
              setLoadedImageObj(fallbackImg);
              setLoadingImage(false);
            };
          }
        };
        img.src = srcToUse;
      } catch (err) {
        console.error("Failed to load image as blob for editor:", err);
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          if (isMounted) {
            setLoadedImageObj(img);
            setLoadingImage(false);
          }
        };
      }
    };

    void loadImage();

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageUrl]);

  // Reset transforms
  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setAspectRatio("free");
    setCrop({ x: 10, y: 10, width: 80, height: 80 });
  };

  // Adjust aspect ratio crop bounds
  const handleSetAspectRatio = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    if (ratio === "1:1") {
      setCrop({ x: 15, y: 15, width: 70, height: 70 });
    } else if (ratio === "4:3") {
      setCrop({ x: 10, y: 17.5, width: 80, height: 60 });
    } else if (ratio === "16:9") {
      setCrop({ x: 5, y: 24, width: 90, height: 50.6 });
    } else {
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
    }
  };

  // Rotate Left (-90 deg)
  const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
  // Rotate Right (+90 deg)
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  // Mouse Dragging for Crop Box
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!activeHandle || !dragStart || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      const initial = dragStart.crop;
      let next = { ...initial };

      if (activeHandle === "move") {
        next.x = Math.max(0, Math.min(100 - initial.width, initial.x + deltaX));
        next.y = Math.max(0, Math.min(100 - initial.height, initial.y + deltaY));
      } else {
        if (activeHandle.includes("w")) {
          const maxW = initial.x + initial.width;
          next.x = Math.max(0, Math.min(maxW - 10, initial.x + deltaX));
          next.width = maxW - next.x;
        }
        if (activeHandle.includes("e")) {
          next.width = Math.max(10, Math.min(100 - initial.x, initial.width + deltaX));
        }
        if (activeHandle.includes("n")) {
          const maxH = initial.y + initial.height;
          next.y = Math.max(0, Math.min(maxH - 10, initial.y + deltaY));
          next.height = maxH - next.y;
        }
        if (activeHandle.includes("s")) {
          next.height = Math.max(10, Math.min(100 - initial.y, initial.height + deltaY));
        }

        // Apply Aspect Ratio Constraint if set
        if (aspectRatio === "1:1") {
          const side = Math.min(next.width, next.height);
          next.width = side;
          next.height = side;
        }
      }

      setCrop(next);
    },
    [activeHandle, dragStart, aspectRatio]
  );

  const handleMouseUp = useCallback(() => {
    setActiveHandle(null);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (activeHandle) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeHandle, handleMouseMove, handleMouseUp]);

  // APPLY & EXPORT CROPPED / ROTATED IMAGE CANVAS
  const handleApply = async () => {
    if (!loadedImageObj) {
      toast.error("Image not loaded yet");
      return;
    }

    setIsSaving(true);
    try {
      const origW = loadedImageObj.naturalWidth || loadedImageObj.width;
      const origH = loadedImageObj.naturalHeight || loadedImageObj.height;

      // 1. Create transformed full image canvas
      const isRotated90 = rotation === 90 || rotation === 270;
      const canvasW = isRotated90 ? origH : origW;
      const canvasH = isRotated90 ? origW : origH;

      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = canvasW;
      fullCanvas.height = canvasH;
      const ctx = fullCanvas.getContext("2d");

      if (!ctx) throw new Error("Could not create canvas context");

      // Translate & Rotate
      ctx.save();
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(loadedImageObj, -origW / 2, -origH / 2);
      ctx.restore();

      // 2. Crop according to crop rectangle percentages
      const cropPxX = Math.round((crop.x / 100) * canvasW);
      const cropPxY = Math.round((crop.y / 100) * canvasH);
      const cropPxW = Math.max(1, Math.round((crop.width / 100) * canvasW));
      const cropPxH = Math.max(1, Math.round((crop.height / 100) * canvasH));

      const croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = cropPxW;
      croppedCanvas.height = cropPxH;
      const cropCtx = croppedCanvas.getContext("2d");

      if (!cropCtx) throw new Error("Could not create crop canvas context");

      cropCtx.drawImage(
        fullCanvas,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        cropPxW,
        cropPxH
      );

      // Export Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        croppedCanvas.toBlob((b) => resolve(b), "image/png", 0.95)
      );

      if (!blob) throw new Error("Failed to render canvas image blob");

      // Upload edited blob to Cloudinary
      const newUrl = await uploadEditedBlob(blob, productId);
      await onSave(newUrl);

      toast.success("Photo cropped & rotated successfully!");
      onClose();
    } catch (err: any) {
      console.error("Failed to crop/rotate image:", err);
      toast.error(err.message || "Failed to process edited photo");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white backdrop-blur-md animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <Crop className="h-5 w-5 text-primary" />
          <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
            Photo Editor — Crop & Rotate
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSaving || loadingImage}
            className="flex items-center gap-2 rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying & Uploading…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save & Apply to Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div className="relative flex-1 overflow-hidden p-6 flex items-center justify-center bg-zinc-950">
        {loadingImage ? (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-wider">Loading image canvas…</span>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative max-h-[65vh] max-w-[80vw] overflow-hidden rounded-lg shadow-2xl select-none"
            style={{
              transform: `scale(${zoom})`,
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Base Image Display */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Source Canvas"
              style={{
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                maxHeight: "65vh",
                maxWidth: "80vw",
                objectFit: "contain",
              }}
              className="block"
            />

            {/* Draggable Crop Box Overlay */}
            <div
              onMouseDown={(e) => handleMouseDown(e, "move")}
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
              className="absolute border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move transition-all duration-75 group"
            >
              {/* Grid guide lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-white/50" />
                <div className="border-r border-white/50" />
              </div>

              {/* Handles */}
              {["nw", "ne", "sw", "se", "n", "s", "w", "e"].map((handle) => (
                <div
                  key={handle}
                  onMouseDown={(e) => handleMouseDown(e, handle)}
                  className={`absolute h-3.5 w-3.5 bg-primary border-2 border-white rounded-full shadow ${
                    handle === "nw" ? "-left-1.5 -top-1.5 cursor-nwse-resize" :
                    handle === "ne" ? "-right-1.5 -top-1.5 cursor-nesw-resize" :
                    handle === "sw" ? "-left-1.5 -bottom-1.5 cursor-nesw-resize" :
                    handle === "se" ? "-right-1.5 -bottom-1.5 cursor-nwse-resize" :
                    handle === "n" ? "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize" :
                    handle === "s" ? "left-1/2 -bottom-1.5 -translate-x-1/2 cursor-ns-resize" :
                    handle === "w" ? "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" :
                    "right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar / Controls */}
      <div className="border-t border-white/10 bg-zinc-900/90 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto text-xs">
          {/* Rotation & Flip Group */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Rotate / Flip</span>
            <button
              type="button"
              onClick={rotateLeft}
              className="rounded bg-white/10 p-2.5 hover:bg-white/20 transition flex items-center gap-1.5 font-medium"
              title="Rotate Left 90°"
            >
              <RotateCcw className="h-4 w-4 text-primary" />
              <span>-90°</span>
            </button>
            <button
              type="button"
              onClick={rotateRight}
              className="rounded bg-white/10 p-2.5 hover:bg-white/20 transition flex items-center gap-1.5 font-medium"
              title="Rotate Right 90°"
            >
              <RotateCw className="h-4 w-4 text-primary" />
              <span>+90°</span>
            </button>
            <button
              type="button"
              onClick={() => setFlipH(!flipH)}
              className={`rounded p-2.5 transition flex items-center gap-1.5 font-medium ${flipH ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20"}`}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="h-4 w-4" />
              <span>Flip H</span>
            </button>
            <button
              type="button"
              onClick={() => setFlipV(!flipV)}
              className={`rounded p-2.5 transition flex items-center gap-1.5 font-medium ${flipV ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20"}`}
              title="Flip Vertical"
            >
              <FlipVertical className="h-4 w-4" />
              <span>Flip V</span>
            </button>
          </div>

          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Aspect Ratio</span>
            {(["free", "1:1", "4:3", "16:9"] as AspectRatio[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleSetAspectRatio(r)}
                className={`rounded px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  aspectRatio === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 hover:bg-white/20 text-gray-300"
                }`}
              >
                {r === "1:1" ? "1:1 Square" : r}
              </button>
            ))}
          </div>

          {/* Zoom Slider & Reset */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 accent-primary"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground w-8">{zoom.toFixed(1)}x</span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="rounded border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition flex items-center gap-1.5 text-muted-foreground hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
