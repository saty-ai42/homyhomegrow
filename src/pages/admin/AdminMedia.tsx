import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Trash2, Plus, X, Loader2, Image, Crop,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useT } from "@/stores/i18nStore";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ImageCropper from "@/components/ImageCropper";

const PREDEFINED_TAGS = [
  { key: "blog", label: "Blog" },
  { key: "guides", label: "Guides" },
  { key: "diary", label: "Diary" },
  { key: "gallery", label: "Gallery" },
  { key: "newsletter", label: "Newsletter" },
  { key: "hero", label: "Hero" },
  { key: "logo", label: "Logo" },
  { key: "social", label: "Social" },
  { key: "products", label: "Products" },
  { key: "grow", label: "Grow" },
];

function fadeUp(i: number) {
  return { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } } };
}

/* Reusable Media Upload Component with Cropper */
export function MediaUpload({
  defaultTags,
  onUpload,
  children,
}: {
  defaultTags?: string[];
  onUpload?: (url: string) => void;
  children?: React.ReactNode;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; type: string } | null>(null);
  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: (data) => {
      toast.success("Bild hochgeladen!");
      onUpload?.(data.url);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { toast.error("Nur Bilder"); return; }
      if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }

      setPendingFile({ name: file.name, type: file.type });
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const handleCrop = useCallback(
    (croppedBase64: string) => {
      setCropImage(null);
      const base64 = croppedBase64.split(",")[1];
      uploadMutation.mutate({
        filename: pendingFile?.name || "image.jpg",
        mimeType: pendingFile?.type || "image/jpeg",
        base64,
        tags: defaultTags,
      });
      setPendingFile(null);
    },
    [uploadMutation, defaultTags, pendingFile]
  );

  const handleCancelCrop = useCallback(() => {
    setCropImage(null);
    setPendingFile(null);
  }, []);

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90 transition-colors disabled:opacity-50"
      >
        {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Crop size={14} />}
        {children || "Upload"}
      </button>
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage}
          aspectRatio={16 / 9}
          onCrop={handleCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </>
  );
}

/* Tag Badge */
function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-[#FF4444] transition-colors"><X size={10} /></button>
      )}
    </span>
  );
}

export default function AdminMedia() {
  const t = useT();
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [search, setSearch] = useState("");
  const [editingTags, setEditingTags] = useState<number | null>(null);
  const [newTag, setNewTag] = useState("");

  const mediaQuery = trpc.media.list.useQuery(
    { tag: selectedTag || undefined, search: search || undefined },
    { refetchInterval: 5000 }
  );
  const tagsQuery = trpc.media.getTags.useQuery();
  const addTagMutation = trpc.media.addTag.useMutation({
    onSuccess: () => { mediaQuery.refetch(); tagsQuery.refetch(); setNewTag(""); },
  });
  const removeTagMutation = trpc.media.removeTag.useMutation({
    onSuccess: () => { mediaQuery.refetch(); tagsQuery.refetch(); },
  });
  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => { toast.success("Gelöscht!"); mediaQuery.refetch(); tagsQuery.refetch(); },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
          <Image className="w-6 h-6 text-[#39FF14]" />
          {t("Media Library", "Media Library")}
          {mediaQuery.data?.total !== undefined && (
            <span className="text-sm font-normal text-muted-foreground">({mediaQuery.data.total})</span>
          )}
        </h1>
        <MediaUpload>
          {t("Bild hochladen", "Upload Image")}
        </MediaUpload>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Tag Filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedTag("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedTag ? "bg-[#39FF14] text-[#0A0A0A]" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
          >
            {t("Alle", "All")}
          </button>
          {tagsQuery.data?.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedTag === tag ? "bg-[#39FF14] text-[#0A0A0A]" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("Nach Name suchen...", "Search by name...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Upload Quick Tags Hint */}
      <div className="flex flex-wrap gap-1 mb-4">
        <span className="text-xs text-muted-foreground mr-1">{t("Schnell-Upload mit Tag:", "Quick upload with tag:")}</span>
        {PREDEFINED_TAGS.map((pt) => (
          <MediaUpload key={pt.key} defaultTags={[pt.key]} onUpload={() => {}}>
            <span className="text-[10px]">+{pt.label}</span>
          </MediaUpload>
        ))}
      </div>

      {/* Grid */}
      {mediaQuery.isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" />{t("Lade...", "Loading...")}</div>
      ) : mediaQuery.data?.items?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaQuery.data.items.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp(i)}
              className="bg-card border border-border rounded-lg overflow-hidden group"
            >
              {/* Image */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img
                  src={item.url || "/placeholder.png"}
                  alt={item.originalName || "Media"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                {/* Delete overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { if (confirm("Löschen?")) deleteMutation.mutate({ id: item.id }); }}
                    className="p-1.5 rounded bg-[#FF4444]/80 text-white hover:bg-[#FF4444] transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-foreground truncate font-mono">{item.originalName}</p>
                <p className="text-[10px] text-muted-foreground">{(item.sizeBytes ? (item.sizeBytes / 1024).toFixed(0) : "0")} KB</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags?.map((tag: string) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      onRemove={() => removeTagMutation.mutate({ mediaId: item.id, tag })}
                    />
                  ))}

                  {/* Add Tag Button */}
                  {editingTags === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newTag.trim()) {
                            addTagMutation.mutate({ mediaId: item.id, tag: newTag.trim() });
                          }
                          if (e.key === "Escape") { setEditingTags(null); setNewTag(""); }
                        }}
                        placeholder="tag..."
                        autoFocus
                        className="w-16 px-1 py-0.5 text-[10px] rounded bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#39FF14]"
                      />
                      <button onClick={() => { if (newTag.trim()) addTagMutation.mutate({ mediaId: item.id, tag: newTag.trim() }); setEditingTags(null); }} className="text-[#39FF14]">
                        <Plus size={10} />
                      </button>
                      <button onClick={() => { setEditingTags(null); setNewTag(""); }} className="text-muted-foreground">
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingTags(item.id)}
                      className="px-1.5 py-0.5 rounded-full text-[10px] border border-dashed border-border text-muted-foreground hover:border-[#39FF14] hover:text-[#39FF14] transition-colors"
                    >
                      +Tag
                    </button>
                  )}
                </div>

                {/* Copy URL */}
                <button
                  onClick={() => { navigator.clipboard.writeText(item.url); toast.success("URL kopiert!"); }}
                  className="mt-2 text-[10px] text-muted-foreground hover:text-[#39FF14] transition-colors font-mono truncate w-full text-left"
                >
                  {item.url}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Image size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">{t("Keine Bilder", "No images")}</p>
          <p className="text-sm">{t("Lade dein erstes Bild hoch", "Upload your first image")}</p>
        </div>
      )}
    </div>
  );
}
