import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AgeVerificationGate from "./AgeVerificationGate";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <AgeVerificationGate />
      <Navbar />
      <main className="pt-16">{children}</main>
      {!hideFooter && <Footer />}
      <CookieBanner />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </div>
  );
}
