import { useState } from "react";
import { FileText, Sprout, ImageIcon } from "lucide-react";

type FallbackType = "blog" | "diary" | "general";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackType?: FallbackType;
  containerClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  className = "",
  fallbackType = "general",
  containerClassName = "",
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    const Icon = fallbackType === "blog" ? FileText : fallbackType === "diary" ? Sprout : ImageIcon;
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-[#39FF14]/10 to-transparent ${containerClassName}`}>
        <div className="text-center">
          <Icon className="w-10 h-10 text-[#39FF14]/40 mx-auto mb-2" />
          <span className="text-xs font-mono text-[#39FF14]/60 uppercase tracking-wider">HomyHomegrow</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
