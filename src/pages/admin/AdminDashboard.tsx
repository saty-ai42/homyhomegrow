import { Link } from "react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, BookOpen, Sprout, Image, Mail, Settings, ArrowRight, Eye, TrendingUp, Globe } from "lucide-react";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/admin/blog", label: "Blog Posts", icon: FileText, desc: "CRUD für Blog-Artikel" },
  { path: "/admin/guides", label: "Grow Guides", icon: BookOpen, desc: "Guides & Schritte verwalten" },
  { path: "/admin/diary", label: "Grow Diaries", icon: Sprout, desc: "Tagebücher & Einträge" },
  { path: "/admin/media", label: "Media Library", icon: Image, desc: "Bilder hochladen & verwalten" },
  { path: "/admin/newsletter", label: "Newsletter", icon: Mail, desc: "Kampagnen erstellen & senden" },
  { path: "/admin/settings", label: "Settings", icon: Settings, desc: "System-Einstellungen" },
];

export default function AdminDashboard() {
  const blogQuery = trpc.blog.list.useQuery({ status: "published", limit: 1 });
  const guideQuery = trpc.guide.list.useQuery({ status: "published", limit: 1 });
  const diaryQuery = trpc.diary.listAll.useQuery({ limit: 1 });
  const newsletterQuery = trpc.newsletter.stats.useQuery();
  const analyticsQuery = trpc.analytics.stats.useQuery();

  const stats = [
    { label: "Blog Posts", value: blogQuery.data?.total ?? 0, icon: FileText, color: "#39FF14" },
    { label: "Guides", value: guideQuery.data?.total ?? 0, icon: BookOpen, color: "#FFD600" },
    { label: "Diaries", value: diaryQuery.data?.total ?? 0, icon: Sprout, color: "#FF4444" },
    { label: "Newsletter", value: newsletterQuery.data?.confirmed ?? 0, icon: Mail, color: "#39FF14" },
  ];

  const a = analyticsQuery.data;
  const growth = a && a.yesterdayViews > 0
    ? Math.round(((a.todayViews - a.yesterdayViews) / a.yesterdayViews) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="w-8 h-8 text-[#39FF14]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading">Admin Dashboard</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-5">
                <stat.icon className="w-5 h-5 mb-3" style={{ color: stat.color }} />
                <div className="text-2xl font-bold text-foreground font-heading">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          {/* Analytics */}
          <div className="bg-card border border-border rounded-xl p-6 mb-10">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#39FF14]" />
              <h2 className="text-xl font-bold text-foreground font-heading">Analytics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <Eye className="w-5 h-5 text-[#39FF14] mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground font-heading">{a?.totalViews ?? 0}</div>
                <div className="text-xs text-muted-foreground">Gesamt Views</div>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-[#FFD600] mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground font-heading">{a?.todayViews ?? 0}</div>
                <div className="text-xs text-muted-foreground">Heute</div>
              </div>
              <div className="text-center">
                <Globe className="w-5 h-5 text-[#FF4444] mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground font-heading">{a?.yesterdayViews ?? 0}</div>
                <div className="text-xs text-muted-foreground">Gestern</div>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-[#39FF14] mx-auto mb-2" />
                <div className={`text-2xl font-bold font-heading ${growth >= 0 ? "text-[#39FF14]" : "text-[#FF4444]"}`}>{growth > 0 ? "+" : ""}{growth}%</div>
                <div className="text-xs text-muted-foreground">Wachstum</div>
              </div>
            </div>
            {a && a.topPages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Top Seiten</h3>
                <div className="space-y-2">
                  {a.topPages.slice(0, 5).map((page: { path: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[70%]">{page.path}</span>
                      <span className="text-foreground font-mono">{page.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-foreground font-heading mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navItems.map((item, i) => (
              <motion.div key={item.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                <Link to={item.path} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-[#39FF14]/30 transition-all group">
                  <div className="p-2 rounded-lg bg-[#39FF14]/10 shrink-0"><item.icon className="w-5 h-5 text-[#39FF14]" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground group-hover:text-[#39FF14] transition-colors flex items-center gap-2">{item.label}<ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
