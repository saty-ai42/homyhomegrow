import { Link } from "react-router";
import { Home } from "lucide-react";
import { useT } from "@/stores/i18nStore";

export default function BackToHome() {
  const t = useT();
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#39FF14] transition-colors mb-4"
    >
      <Home size={14} />
      {t("Home", "Home")}
    </Link>
  );
}
