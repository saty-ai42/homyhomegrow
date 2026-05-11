import { Link } from "react-router";
import { Youtube, Rss } from "lucide-react";
import { useI18n, useT } from "@/stores/i18nStore";

import { useState } from "react";
import { trpc } from "@/providers/trpc";

const footerNav = [
  { path: "/", labelDe: "Home", labelEn: "Home" },
  { path: "/blog", labelDe: "Blog", labelEn: "Blog" },
  { path: "/guides", labelDe: "Guides", labelEn: "Guides" },
  { path: "/diary", labelDe: "Diary", labelEn: "Diary" },
  { path: "/gallery", labelDe: "Gallery", labelEn: "Gallery" },
  { path: "/about", labelDe: "About", labelEn: "About" },
];

interface FooterLink {
  path: string;
  labelDe: string;
  labelEn: string;
  external?: boolean;
}

const footerLegal: FooterLink[] = [
  { path: "/privacy", labelDe: "Datenschutz", labelEn: "Privacy" },
  { path: "/imprint", labelDe: "Impressum", labelEn: "Imprint" },
  { path: "/terms", labelDe: "AGB", labelEn: "Terms" },
];

export default function Footer() {
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubscribed(true);
      setEmail("");
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate({ email });
    }
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-0">
              <span className="text-lg font-bold text-foreground font-heading">HOMYHOME</span>
              <span className="text-lg font-bold text-[#39FF14] font-heading">GROW</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t(
                "Deine Community für Cannabis Anbau. Guides, Diaries & mehr.",
                "Your community for cannabis cultivation. Guides, diaries & more."
              )}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.youtube.com/@HomyHomegrow" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-card text-muted-foreground hover:text-[#FF4444] hover:bg-secondary transition-colors" title="YouTube 11K"><Youtube size={18} /></a>
              <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-card text-muted-foreground hover:text-[#39FF14] hover:bg-secondary transition-colors" title="RSS Feed"><Rss size={18} /></a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-heading">
              {t("Navigation", "Navigation")}
            </h3>
            <ul className="mt-3 space-y-2">
              {footerNav.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-[#39FF14] transition-colors">
                    {locale === "en" ? link.labelEn : link.labelDe}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-heading">
              {t("Rechtliches", "Legal")}
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLegal.map((link) => (
                <li key={link.path}>
                  {link.external ? (
                    <a href={link.path} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-[#39FF14] transition-colors">
                      {locale === "en" ? link.labelEn : link.labelDe}
                    </a>
                  ) : (
                    <Link to={link.path} className="text-sm text-muted-foreground hover:text-[#39FF14] transition-colors">
                      {locale === "en" ? link.labelEn : link.labelDe}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-heading">Newsletter</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("Bleib auf dem Laufenden.", "Stay up to date.")}
            </p>
            {subscribed ? (
              <p className="mt-3 text-sm text-[#39FF14]">
                {t("Danke! Bitte bestätige deine Email.", "Thanks! Please confirm your email.")}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Deine Email", "Your email")}
                  required
                  className="flex-1 min-w-0 px-3 py-2 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#39FF14] transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="px-4 py-2 rounded-md text-sm font-medium text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors disabled:opacity-50"
                >
                  OK
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {t(
              "Hinweis: Alle Informationen dienen ausschließlich Bildungszwecken im Rahmen der Gesetze. Bitte informiere dich über die rechtlichen Bestimmungen in deinem Land.",
              "Note: All information is for educational purposes only within the framework of the law. Please inform yourself about the legal regulations in your country."
            )}
          </p>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} HomyHomegrow. {t("Alle Rechte vorbehalten.", "All rights reserved.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
