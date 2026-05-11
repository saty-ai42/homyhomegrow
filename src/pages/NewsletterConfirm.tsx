import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Check, X, Loader2, Mail } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useT } from "@/stores/i18nStore";

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const t = useT();
  const [confirmed, setConfirmed] = useState(false);

  const confirmMutation = trpc.newsletter.confirm.useMutation({
    onSuccess: () => setConfirmed(true),
  });

  const handleConfirm = () => {
    if (token) confirmMutation.mutate({ token });
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
              {t("Der Bestätigungslink ist ungültig.", "The confirmation link is invalid.")}
            </p>
          </>
        ) : confirmMutation.isPending ? (
          <>
            <Loader2 className="w-12 h-12 text-[#39FF14] mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-foreground font-heading">
              {t("Bestätige...", "Confirming...")}
            </h1>
          </>
        ) : confirmed && confirmMutation.data?.success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#39FF14]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              {t("Willkommen!", "Welcome!")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(
                "Deine Newsletter-Anmeldung ist bestätigt. Check dein Postfach für eine Willkommens-Email!",
                "Your newsletter subscription is confirmed. Check your inbox for a welcome email!"
              )}
            </p>
            <div className="mt-4 p-3 rounded-lg bg-[#39FF14]/5 border border-[#39FF14]/20 text-sm text-[#39FF14]">
              {t("Du erhältst jetzt Updates zu neuen Guides und Grow-Tipps.", "You will now receive updates on new guides and grow tips.")}
            </div>
          </>
        ) : confirmMutation.data && !confirmMutation.data.success ? (
          <>
            <X className="w-12 h-12 text-[#FF4444] mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground font-heading">
              {t("Fehler", "Error")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {confirmMutation.data.message || t("Etwas ist schiefgelaufen.", "Something went wrong.")}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#39FF14]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              {t("Newsletter bestätigen", "Confirm Newsletter")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(
                "Klicke auf den Button, um deine Anmeldung abzuschließen.",
                "Click the button to complete your subscription."
              )}
            </p>
            <button
              onClick={handleConfirm}
              className="mt-6 px-6 py-3 rounded-lg font-bold text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors"
            >
              {t("Anmeldung bestätigen", "Confirm Subscription")}
            </button>
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
