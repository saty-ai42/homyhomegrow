import { useState, useRef, useCallback, useEffect } from "react";
import { Crop, RotateCcw, Check, X, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio: number; // e.g. 16/9 = 1.777
  onCrop: (croppedImageBase64: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, aspectRatio, onCrop, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  // Calculate crop area based on aspect ratio
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const imgAspect = img.width / img.height;
      setImgSize({ w: img.width, h: img.height });
      
      if (imgAspect > aspectRatio) {
        // Image is wider than target: fit height, crop width
        const cropH = 100;
        const cropW = (aspectRatio / imgAspect) * 100;
        setCrop({ x: (100 - cropW) / 2, y: 0, w: cropW, h: cropH });
      } else {
        // Image is taller than target: fit width, crop height
        const cropW = 100;
        const cropH = (imgAspect / aspectRatio) * 100;
        setCrop({ x: 0, y: (100 - cropH) / 2, w: cropW, h: cropH });
      }
    };
    img.src = imageSrc;
  }, [imageSrc, aspectRatio]);

  // Mouse handlers for dragging crop area
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / rect.height) * 100;
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.w, prev.x + dx)),
      y: Math.max(0, Math.min(100 - prev.h, prev.y + dy)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Generate cropped image
  const handleCrop = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate target dimensions (16:9, max 1920px wide)
      const targetW = Math.min(1920, img.width);
      const targetH = Math.round(targetW / aspectRatio);
      
      canvas.width = targetW;
      canvas.height = targetH;

      const sx = (crop.x / 100) * img.width;
      const sy = (crop.y / 100) * img.height;
      const sw = (crop.w / 100) * img.width;
      const sh = (crop.h / 100) * img.height;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      
      // Compress to WebP quality 90
      const dataUrl = canvas.toDataURL("image/webp", 0.9);
      onCrop(dataUrl);
    };
    img.src = imageSrc;
  }, [imageSrc, crop, aspectRatio, onCrop]);

  // Reset to default crop
  const handleReset = useCallback(() => {
    const imgAspect = imgSize.w / imgSize.h;
    if (imgAspect > aspectRatio) {
      const cropH = 100;
      const cropW = (aspectRatio / imgAspect) * 100;
      setCrop({ x: (100 - cropW) / 2, y: 0, w: cropW, h: cropH });
    } else {
      const cropW = 100;
      const cropH = (imgAspect / aspectRatio) * 100;
      setCrop({ x: 0, y: (100 - cropH) / 2, w: cropW, h: cropH });
    }
  }, [imgSize, aspectRatio]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative bg-card border border-border rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Crop size={16} className="text-[#39FF14]" />
            <h2 className="text-sm font-bold text-foreground">Bild zuschneiden (16:9)</h2>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-lg bg-muted cursor-move select-none"
            style={{ maxHeight: "60vh" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            {/* Original Image (dimmed) */}
            <img
              src={imageSrc}
              alt="Original"
              className="w-full h-full object-contain opacity-40"
              draggable={false}
            />
            
            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-[#39FF14] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
              }}
            >
              {/* Draggable indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Move size={16} className="text-[#39FF14] drop-shadow-lg opacity-60" />
              </div>
              
              {/* Grid lines */}
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(to right, rgba(57,255,20,0.2) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(57,255,20,0.2) 1px, transparent 1px)`,
                backgroundSize: "33.33% 33.33%",
              }} />
            </div>

            {/* Aspect ratio indicator */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-[#39FF14] text-[10px] px-2 py-0.5 rounded font-mono">
              16:9
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Ziehe den Rahmen um den gewünschten Ausschnitt auszuwählen
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw size={14} className="mr-1.5" />Zurücksetzen
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X size={14} className="mr-1.5" />Abbrechen
            </Button>
            <Button size="sm" onClick={handleCrop} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90">
              <Check size={14} className="mr-1.5" />Zuschneiden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
