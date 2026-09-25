import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo } from "@/lib/seo";
import { Users, Calendar, FileText, UserCog, TrendingUp, Mail } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import MembersSection from "@/components/admin/MembersSection";

const TABS = [
  { id: "leads", label: "Leads", icon: Mail },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "trainers", label: "Trainers", icon: UserCog },
  { id: "members", label: "Members", icon: TrendingUp },
  { id: "memberships", label: "Memberships", icon: TrendingUp },
  { id: "passes", label: "Passes", icon: Users },
  { id: "articles", label: "Content", icon: FileText },
];

const STATUS_COLORS = {
  New: "bg-gold/20 text-gold",
  Contacted: "bg-blue-500/20 text-blue-300",
  Qualified: "bg-purple-500/20 text-purple-300",
  Confirmed: "bg-green-500/20 text-green-300",
  Completed: "bg-green-500/20 text-green-300",
  Converted: "bg-green-500/20 text-green-300",
  Cancelled: "bg-red-500/20 text-red-300",
  Lost: "bg-red-500/20 text-red-300",
};

export default function Admin() {
  useSeo({ title: "Admin — CMS", description: "Staff dashboard", noindex: true });
  const { user } = useAuth();
  const [tab, setTab] = useState("leads");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      base44.entities.Lead.list("-created_date").catch(() => []),
      base44.entities.Booking.list("-created_date").catch(() => []),
      base44.entities.Trainer.list().catch(() => []),
      base44.entities.Membership.list().catch(() => []),
      base44.entities.Member.list().catch(() => []),
      base44.entities.Pass.list().catch(() => []),
      base44.entities.Article.list("-created_date").catch(() => []),
    ]).then(([leads, bookings, trainers, memberships, members, passes, articles]) => {
      setData({ leads, bookings, trainers, memberships, members, passes, articles });
      setLoading(false);
    });
  }, [user?.role]);

  const updateStatus = async (entity, id, status) => {
    try {
      await base44.entities[entity].update(id, { status });
      setData((d) => ({ ...d, [entity]: d[entity].map((r) => (r.id === id ? { ...r, status } : r)) }));
    } catch (e) { alert("Update failed"); }
  };

  const counts = {
    leads: data.leads?.length || 0,
    bookings: data.bookings?.length || 0,
    trainers: data.trainers?.length || 0,
    members: data.members?.length || 0,
    memberships: data.memberships?.length || 0,
    passes: data.passes?.length || 0,
    articles: data.articles?.length || 0,
  };

  if (user?.role !== "admin") {
    return <div className="pt-32 min-h-screen px-5 text-center"><h1 className="font-heading text-4xl text-white">ADMIN ACCESS ONLY</h1><p className="mt-3 text-white/55">This area is restricted to Gold's Gym Hurghada administrators.</p><Link to="/" className="mt-6 inline-block text-gold hover:underline">← Back to site</Link></div>;
  }

  return (
    <div className="pt-24 min-h-screen px-5 lg:px-10 pb-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <h1 className="font-heading text-4xl text-white">CMS DASHBOARD</h1>
            <p className="text-white/45 text-sm mt-1">Manage content, leads and bookings — no developer needed.</p>
          </div>
          <Link to="/" className="text-sm text-gold hover:underline">← Back to site</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1 p-4 border transition-all ${tab === t.id ? "border-gold bg-gold/10" : "border-white/10 hover:border-gold/50"}`}>
              <t.icon className={`w-5 h-5 ${tab === t.id ? "text-gold" : "text-white/50"}`} />
              <span className="text-[11px] font-semibold tracking-wide uppercase text-white/70">{t.label}</span>
              <span className="font-heading text-xl text-white">{counts[t.id]}</span>
            </button>
          ))}
        </div>

        {loading ? <p className="text-white/40">Loading…</p> : (
          <div className="border border-white/10 bg-white/[0.02]">
            {tab === "leads" && (
              <Table headers={["Name","Type","Contact","Product/Trainer","Source","Date","Status"]}>
                {(data.leads || []).map((l) => (
                  <tr key={l.id} className="border-t border-white/5 text-sm">
                    <td className="p-3 text-white">{l.name}</td>
                    <td className="p-3 text-white/60 capitalize">{l.lead_type}</td>
                    <td className="p-3 text-white/60">{l.phone}{l.email ? ` · ${l.email}` : ""}</td>
                    <td className="p-3 text-white/60">{l.product || l.trainer || "—"}</td>
                    <td className="p-3 text-white/40 text-xs">{l.source_page}</td>
                    <td className="p-3 text-white/40 text-xs">{l.created_date?.slice(0,10)}</td>
                    <td className="p-3">
                      <select value={l.status} onChange={(e) => updateStatus("Lead", l.id, e.target.value)} className={`text-xs px-2 py-1 border-0 ${STATUS_COLORS[l.status] || "bg-white/10 text-white"}`}>
                        {["New","Contacted","Qualified","Converted","Lost"].map((s) => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {(data.leads || []).length === 0 && <tr><td className="p-8 text-white/30 text-center">No leads yet.</td></tr>}
              </Table>
            )}

            {tab === "bookings" && (
              <Table headers={["Name","Trainer","Date/Time","Goal","Contact","Member","Status"]}>
                {(data.bookings || []).map((b) => (
                  <tr key={b.id} className="border-t border-white/5 text-sm">
                    <td className="p-3 text-white">{b.name}</td>
                    <td className="p-3 text-white/60">{b.trainer_name}</td>
                    <td className="p-3 text-white/60 text-xs">{b.preferred_date} {b.preferred_time}</td>
                    <td className="p-3 text-white/60 text-xs">{b.training_goal || "—"}</td>
                    <td className="p-3 text-white/60 text-xs">{b.phone}{b.whatsapp ? ` / ${b.whatsapp}` : ""}</td>
                    <td className="p-3 text-white/60 text-xs">{b.is_member ? "Yes" : "No"}</td>
                    <td className="p-3">
                      <select value={b.status} onChange={(e) => updateStatus("Booking", b.id, e.target.value)} className={`text-xs px-2 py-1 border-0 ${STATUS_COLORS[b.status] || "bg-white/10 text-white"}`}>
                        {["New","Contacted","Confirmed","Completed","Cancelled"].map((s) => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {(data.bookings || []).length === 0 && <tr><td className="p-8 text-white/30 text-center">No bookings yet.</td></tr>}
              </Table>
            )}

            {tab === "trainers" && (
              <Table headers={["Name","Title","Experience","Specializations","Slug"]}>
                {(data.trainers || []).map((t) => (
                  <tr key={t.id} className="border-t border-white/5 text-sm">
                    <td className="p-3 text-white">{t.name}</td>
                    <td className="p-3 text-white/60">{t.title}</td>
                    <td className="p-3 text-white/60">{t.years_experience}+ yrs</td>
                    <td className="p-3 text-white/60 text-xs">{(t.specializations || []).join(", ")}</td>
                    <td className="p-3 text-white/40 text-xs"><Link to={`/trainers/${t.slug}`} className="text-gold hover:underline">/{t.slug}</Link></td>
                  </tr>
                ))}
                {(data.trainers || []).length === 0 && <tr><td className="p-8 text-white/30 text-center">No trainers yet. Add trainers via the database to populate the directory.</td></tr>}
              </Table>
            )}

            {tab === "members" && <MembersSection memberships={data.memberships || []} />}

            {tab === "memberships" && (
              <Table headers={["Name","Price","Duration","Recommended","Featured"]}>
                {(data.memberships || []).map((m) => (
                  <tr key={m.id} className="border-t border-white/5 text-sm">
                    <td className="p-3 text-white">{m.name}</td>
                    <td className="p-3 text-gold font-heading">{m.price} {m.currency}</td>
                    <td className="p-3 text-white/60">{m.duration}</td>
                    <td className="p-3 text-white/60 text-xs">{m.recommended_for}</td>
                    <td className="p-3 text-white/60 text-xs">{m.is_featured ? "★" : "—"}</td>
                  </tr>
                ))}
                {(data.memberships || []).length === 0 && <tr><td className="p-8 text-white/30 text-center">No memberships configured.</td></tr>}
              </Table>
            )}

            {tab === "passes" && (
              <Table headers={["Name","Price","Days","Recommended","Slug"]}>
                {(data.passes || []).map((p) => (
                  <tr key={p.id} className="border-t border-white/5 text-sm">
                    <td className="p-3 text-white">{p.name}</td>
                    <td className="p-3 text-gold font-heading">{p.price} {p.currency}</td>
                    <td className="p-3 text-white/60">{p.days}</td>
                    <td className="p-3 text-white/60 text-xs">{p.recommended_for}</td>
                    <td className="p-3 text-white/40 text-xs"><Link to={`/passes/${p.slug}`} className="text-gold hover:underline">/{p.slug}</Link></td>
                  </tr>
                ))}
                {(data.passes || []).length === 0 && <tr><td className="p-8 text-white/30 text-center">No passes configured.</td></tr>}
              </Table>
            )}

            {tab === "articles" && (
              <Table headers={["Title","Section","Category","Author","Slug"]}>
                {(data.articles || []).map((a) => (
                  <tr key={a.id} className="border-t border-white/5 text-sm">
                    <td className="p-3 text-white">{a.title}</td>
                    <td className="p-3 text-white/60 capitalize">{a.section.replace("-", " ")}</td>
                    <td className="p-3 text-white/60 text-xs">{a.category}</td>
                    <td className="p-3 text-white/60 text-xs">{a.author_name || "—"}</td>
                    <td className="p-3 text-white/40 text-xs"><Link to={`/${a.section}/${a.slug}`} className="text-gold hover:underline">/{a.section}/{a.slug}</Link></td>
                  </tr>
                ))}
                {(data.articles || []).length === 0 && <tr><td className="p-8 text-white/30 text-center">No content yet.</td></tr>}
              </Table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto hide-scrollbar">
      <table className="w-full">
        <thead><tr className="border-b border-white/10">{headers.map((h) => <th key={h} className="text-left p-3 text-[10px] tracking-wide text-white/40 uppercase font-semibold">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
