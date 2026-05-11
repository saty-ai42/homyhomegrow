import { Routes, Route } from "react-router";
import Layout from "./components/Layout";

// Public Pages
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import GuideList from "./pages/GuideList";
import GuideDetail from "./pages/GuideDetail";
import DiaryList from "./pages/DiaryList";
import DiaryDetail from "./pages/DiaryDetail";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Imprint from "./pages/Imprint";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import ToolsOverview from "./pages/ToolsOverview";
import VpdCalculator from "./pages/VpdCalculator";
import StromRechner from "./pages/tools/StromRechner";
import LuxPpfdDli from "./pages/tools/LuxPpfdDli";
import NewsletterConfirm from "./pages/NewsletterConfirm";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminGuides from "./pages/admin/AdminGuides";
import AdminDiaries from "./pages/admin/AdminDiaries";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminSettings from "./pages/admin/AdminSettings";

// 404
import NotFound from "./pages/NotFound";

// Analytics
import { usePageView } from "./hooks/usePageView";

// Admin Guard
import { useAuth } from "./hooks/useAuth";
import AdminGuard from "./components/AdminGuard";
import type { ReactNode } from "react";

function AnalyticsTracker() {
  usePageView();
  return null;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user || user.role !== "admin") {
    return <AdminGuard />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <AnalyticsTracker />
      <Routes>
        {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/blog" element={<Layout><BlogList /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><BlogDetail /></Layout>} />
      <Route path="/guides" element={<Layout><GuideList /></Layout>} />
      <Route path="/guides/:slug" element={<Layout><GuideDetail /></Layout>} />
      <Route path="/diary" element={<Layout><DiaryList /></Layout>} />
      <Route path="/diary/:slug" element={<Layout><DiaryDetail /></Layout>} />
      <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
      <Route path="/imprint" element={<Layout><Imprint /></Layout>} />
      <Route path="/terms" element={<Layout><Terms /></Layout>} />
      <Route path="/tools" element={<Layout><ToolsOverview /></Layout>} />
      <Route path="/tools/vpd-calculator" element={<Layout><VpdCalculator /></Layout>} />
      <Route path="/tools/stromrechner" element={<Layout><StromRechner /></Layout>} />
      <Route path="/tools/lux-ppfd-dli" element={<Layout><LuxPpfdDli /></Layout>} />
      <Route path="/login" element={<Layout hideFooter><Login /></Layout>} />
      <Route path="/newsletter/confirm" element={<Layout><NewsletterConfirm /></Layout>} />
      <Route path="/newsletter/unsubscribe" element={<Layout><NewsletterUnsubscribe /></Layout>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
      <Route path="/admin/blog" element={<AdminRoute><Layout><AdminBlog /></Layout></AdminRoute>} />
      <Route path="/admin/guides" element={<AdminRoute><Layout><AdminGuides /></Layout></AdminRoute>} />
      <Route path="/admin/diary" element={<AdminRoute><Layout><AdminDiaries /></Layout></AdminRoute>} />
      <Route path="/admin/media" element={<AdminRoute><Layout><AdminMedia /></Layout></AdminRoute>} />
      <Route path="/admin/newsletter" element={<AdminRoute><Layout><AdminNewsletter /></Layout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><Layout><AdminSettings /></Layout></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
    </>
  );
}
