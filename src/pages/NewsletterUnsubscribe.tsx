import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Check, X, Mail } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useT } from "@/stores/i18nStore";
import { toast } from "sonner";

export default function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const t = useT();
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  const unsubMutation = trpc.newsletter.unsubscribe.useMutation({
    onSuccess: () => setDone(true),
    onError: (err) => toast?.error?.(err.message),
  });

  const handleUnsubscribe = () => {
    if (token) unsubMutation.mutate({ token, reason: reason || undefined });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center"
      >
        {!token ? (
          <>
            <X className="w-12 h-12 text-[#FF4444] mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground font-heading">
              {t("Ungültiger Link", "Invalid Link")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("Der Abmelde-Link ist ungültig.", "The unsubscribe link is invalid.")}
            </p>
          </>
        ) : done && unsubMutation.data?.success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#39FF14]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              {t("Erledigt!", "Done!")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("Du wurdest erfolgreich vom Newsletter abgemeldet.", "You have been successfully unsubscribed from the newsletter.")}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#FF4444]/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#FF4444]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              {t("Newsletter abbestellen?", "Unsubscribe from newsletter?")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("Schade, dass du gehst! Optional: Warum möchtest du den Newsletter abbestellen?", "We're sorry to see you go! Optional: Why do you want to unsubscribe?")}
            </p>
            <div className="mt-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("Zu viele Emails / Nicht mehr interessiert / ...", "Too many emails / No longer interested / ...")}
                className="w-full p-3 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#39FF14] resize-none h-20"
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleUnsubscribe}
                disabled={unsubMutation.isPending}
                className="w-full px-6 py-3 rounded-lg font-bold text-white bg-[#FF4444] hover:bg-[#FF4444]/90 transition-colors disabled:opacity-50"
              >
                {unsubMutation.isPending ? t("...", "...") : t("Abbestellen", "Unsubscribe")}
              </button>
              <Link
                to="/"
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("Nein, doch nicht", "No, keep me subscribed")}
              </Link>
            </div>
          </>
        )}
        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 rounded-md text-sm font-medium text-foreground border border-border hover:bg-secondary transition-colors"
        >
          {t("Zur Startseite", "Back to Home")}
        </Link>
      </motion.div>
    </div>
  );
}
