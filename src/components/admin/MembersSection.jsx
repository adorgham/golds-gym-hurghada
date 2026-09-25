import { useEffect, useMemo, useState } from "react";
import { Archive, CalendarPlus, Pencil, Plus, Search, Snowflake } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const EMPTY_MEMBER = { full_name: "", email: "", phone: "", notes: "" };
const EMPTY_TERM = { membership_id: "", start_date: today(), expiry_date: "", notes: "" };
const EMPTY_FREEZE = { start_date: today(), end_date: today(), reason: "" };

function today() { return new Date().toISOString().slice(0, 10); }
function dateAtMidnight(value) { return new Date(`${value}T00:00:00`); }
function formatDate(value) { return value ? dateAtMidnight(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"; }
function addDays(value, days) { const date = dateAtMidnight(value); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
function freezeDays(start, end) { return Math.floor((dateAtMidnight(end) - dateAtMidnight(start)) / 86400000) + 1; }

function calculatedStatus(member, term, freezes) {
  if (member.status === "Archived") return "Archived";
  if (!term) return "Expired";
  const now = today();
  if (freezes.some((freeze) => freeze.status === "Approved" && freeze.start_date <= now && freeze.end_date >= now)) return "Frozen";
  return term.expiry_date < now ? "Expired" : "Active";
}

function statusClass(status) {
  return ({ Active: "bg-green-500/15 text-green-300", Frozen: "bg-sky-500/15 text-sky-300", Expired: "bg-white/10 text-white/55", Archived: "bg-red-500/15 text-red-300" })[status] || "bg-white/10 text-white/55";
}

export default function MembersSection({ memberships }) {
  const [members, setMembers] = useState([]);
  const [terms, setTerms] = useState([]);
  const [freezes, setFreezes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [memberDialog, setMemberDialog] = useState(null);
  const [termDialog, setTermDialog] = useState(null);
  const [freezeDialog, setFreezeDialog] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [nextMembers, nextTerms, nextFreezes] = await Promise.all([
      base44.entities.Member.list("full_name").catch(() => []),
      base44.entities.MembershipTerm.list("-start_date").catch(() => []),
      base44.entities.FreezePeriod.list("-start_date").catch(() => []),
    ]);
    setMembers(nextMembers);
    setTerms(nextTerms);
    setFreezes(nextFreezes);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => members.map((member) => {
    const memberTerms = terms.filter((term) => term.member_id === member.id).sort((a, b) => b.start_date.localeCompare(a.start_date));
    const term = memberTerms.find((item) => item.status !== "Archived") || memberTerms[0];
    const memberFreezes = freezes.filter((freeze) => freeze.membership_term_id === term?.id);
    return { member, term, freezes: memberFreezes, status: calculatedStatus(member, term, memberFreezes) };
  }), [members, terms, freezes]);

  const filteredRows = rows.filter((row) => {
    const term = row.term || {};
    const haystack = `${row.member.full_name} ${row.member.email} ${row.member.phone} ${row.member.membership_number} ${term.plan_name || ""}`.toLowerCase();
    const expiringSoon = term.expiry_date && term.expiry_date >= today() && term.expiry_date <= addDays(today(), 30);
    return (!query || haystack.includes(query.toLowerCase())) && (filter === "All" || row.status === filter || (filter === "Expiring soon" && expiringSoon));
  });

  const counts = rows.reduce((result, row) => ({ ...result, [row.status]: (result[row.status] || 0) + 1 }), {});
  const nextMembershipNumber = () => {
    const highest = members.reduce((max, member) => Math.max(max, Number((member.membership_number || "").match(/(\d+)$/)?.[1] || 0)), 0);
    return `GGH-${String(highest + 1).padStart(6, "0")}`;
  };

  const saveMember = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    setSaving(true); setError("");
    try {
      if (memberDialog.member) {
        await base44.entities.Member.update(memberDialog.member.id, data);
      } else {
        const member = await base44.entities.Member.create({ ...data, membership_number: nextMembershipNumber(), status: "Active" });
        const plan = memberships.find((item) => item.id === data.membership_id);
        await base44.entities.MembershipTerm.create({
          member_id: member.id, membership_id: data.membership_id || "", plan_name: plan?.name || "Custom membership",
          start_date: data.start_date, expiry_date: data.expiry_date, status: "Active", notes: data.term_notes || "",
        });
      }
      setMemberDialog(null); await load();
    } catch (cause) { setError(cause.message || "Could not save this member."); } finally { setSaving(false); }
  };

  const saveTerm = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget); const data = Object.fromEntries(form.entries());
    const plan = memberships.find((item) => item.id === data.membership_id);
    setSaving(true); setError("");
    try {
      await base44.entities.MembershipTerm.create({ member_id: termDialog.member.id, membership_id: data.membership_id || "", plan_name: plan?.name || "Custom membership", start_date: data.start_date, expiry_date: data.expiry_date, status: "Active", notes: data.notes || "" });
      setTermDialog(null); await load();
    } catch (cause) { setError(cause.message || "Could not create the new membership term."); } finally { setSaving(false); }
  };

  const saveFreeze = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget); const data = Object.fromEntries(form.entries());
    if (data.end_date < data.start_date) return setError("The freeze end date must be on or after its start date.");
    const conflicts = freezeDialog.freezes.some((freeze) => freeze.status === "Approved" && data.start_date <= freeze.end_date && data.end_date >= freeze.start_date);
    if (conflicts) return setError("This freeze overlaps an existing approved freeze.");
    setSaving(true); setError("");
    try {
      await base44.entities.FreezePeriod.create({ membership_term_id: freezeDialog.term.id, start_date: data.start_date, end_date: data.end_date, reason: data.reason || "", status: "Approved" });
      await base44.entities.MembershipTerm.update(freezeDialog.term.id, { expiry_date: addDays(freezeDialog.term.expiry_date, freezeDays(data.start_date, data.end_date)) });
      setFreezeDialog(null); await load();
    } catch (cause) { setError(cause.message || "Could not add the freeze period."); } finally { setSaving(false); }
  };

  const archiveMember = async (member) => {
    if (!window.confirm(`Archive ${member.full_name}? Their membership history will be retained.`)) return;
    try { await base44.entities.Member.update(member.id, { status: "Archived" }); await load(); }
    catch (cause) { window.alert(cause.message || "Could not archive this member."); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-5">
        <div><h2 className="font-heading text-2xl text-white">MEMBERS</h2><p className="mt-1 text-sm text-white/45">Manage member records, membership terms and approved freezes.</p></div>
        <Button onClick={() => { setError(""); setMemberDialog({ member: null }); }} className="bg-gold text-obsidian hover:bg-gold/90"><Plus /> Add member</Button>
      </div>
      <>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {["Active", "Frozen", "Expired", "Archived"].map((status) => <button key={status} onClick={() => setFilter(filter === status ? "All" : status)} className={`border p-3 text-left ${filter === status ? "border-gold bg-gold/10" : "border-white/10"}`}><p className="text-xs text-white/45">{status}</p><p className="font-heading text-2xl text-white">{counts[status] || 0}</p></button>)}
        </div>
        <div className="flex flex-wrap gap-3 px-5 pb-5">
          <label className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, email or ID" className="border-white/15 bg-white/5 pl-9 text-white" /></label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-md border border-white/15 bg-obsidian px-3 text-sm text-white"><option>All</option><option>Active</option><option>Frozen</option><option>Expiring soon</option><option>Expired</option><option>Archived</option></select>
        </div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-y border-white/10 text-left text-[10px] uppercase tracking-wide text-white/40"><th className="p-3">Member</th><th className="p-3">ID</th><th className="p-3">Contact</th><th className="p-3">Plan</th><th className="p-3">Start</th><th className="p-3">Expiry</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="8" className="p-8 text-center text-white/35">Loading members…</td></tr> : filteredRows.map((row) => <tr key={row.member.id} className="border-b border-white/5 text-sm"><td className="p-3 text-white"><p>{row.member.full_name}</p><p className="text-xs text-white/40">{row.freezes.length} freeze{row.freezes.length === 1 ? "" : "s"}</p></td><td className="p-3 font-mono text-xs text-gold">{row.member.membership_number}</td><td className="p-3 text-xs text-white/60">{row.member.email}<br />{row.member.phone}</td><td className="p-3 text-white/60">{row.term?.plan_name || "—"}</td><td className="p-3 text-xs text-white/60">{formatDate(row.term?.start_date)}</td><td className="p-3 text-xs text-white/60">{formatDate(row.term?.expiry_date)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${statusClass(row.status)}`}>{row.status}</span></td><td className="p-3"><div className="flex gap-1"><Button size="icon" variant="ghost" title="Edit member" onClick={() => { setError(""); setMemberDialog({ member: row.member }); }}><Pencil /></Button><Button size="icon" variant="ghost" title="Renew membership" disabled={row.status === "Archived"} onClick={() => { setError(""); setTermDialog({ member: row.member, term: row.term }); }}><CalendarPlus /></Button><Button size="icon" variant="ghost" title="Add freeze" disabled={!row.term || row.status === "Archived"} onClick={() => { setError(""); setFreezeDialog(row); }}><Snowflake /></Button><Button size="icon" variant="ghost" title="Archive member" disabled={row.status === "Archived"} onClick={() => archiveMember(row.member)}><Archive /></Button></div></td></tr>)}
          {!loading && filteredRows.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-white/35">No members match this view.</td></tr>}
        </tbody></table></div>
      </>

      <MemberDialog state={memberDialog} memberships={memberships} error={error} saving={saving} onOpenChange={setMemberDialog} onSubmit={saveMember} nextMembershipNumber={nextMembershipNumber()} />
      <TermDialog state={termDialog} memberships={memberships} error={error} saving={saving} onOpenChange={setTermDialog} onSubmit={saveTerm} />
      <FreezeDialog state={freezeDialog} error={error} saving={saving} onOpenChange={setFreezeDialog} onSubmit={saveFreeze} />
    </div>
  );
}

function DialogShell({ open, onOpenChange, title, description, children }) { return <Dialog open={Boolean(open)} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-obsidian text-white"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription className="text-white/50">{description}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>; }
function Field({ label, children }) { return <label className="block text-sm text-white/70"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function Error({ error }) { return error ? <p className="rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p> : null; }

function MemberDialog({ state, memberships, error, saving, onOpenChange, onSubmit, nextMembershipNumber }) {
  if (!state) return null; const member = state.member; const defaults = member || EMPTY_MEMBER;
  return <DialogShell open={state} onOpenChange={(open) => !open && onOpenChange(null)} title={member ? "Edit member" : "Add member"} description={member ? "Member ID cannot be changed." : "A current membership term is created with this member."}><form onSubmit={onSubmit} className="space-y-4"><Error error={error} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><Input name="full_name" defaultValue={defaults.full_name} required /></Field><Field label="Membership ID"><Input value={member?.membership_number || nextMembershipNumber} disabled /></Field><Field label="Email"><Input name="email" type="email" defaultValue={defaults.email} required /></Field><Field label="Phone"><Input name="phone" defaultValue={defaults.phone} required /></Field></div>{!member && <div className="grid gap-4 sm:grid-cols-2"><Field label="Plan"><select name="membership_id" required className="h-9 w-full rounded-md border border-white/15 bg-obsidian px-3 text-sm"><option value="">Select a plan</option>{memberships.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></Field><Field label="Start date"><Input name="start_date" type="date" defaultValue={EMPTY_TERM.start_date} required /></Field><Field label="Expiry date"><Input name="expiry_date" type="date" required /></Field><Field label="Term note"><Input name="term_notes" placeholder="Optional" /></Field></div>}<Field label="Internal member note"><textarea name="notes" defaultValue={defaults.notes} className="min-h-20 w-full rounded-md border border-white/15 bg-transparent p-3 text-sm" /></Field><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(null)}>Cancel</Button><Button disabled={saving} className="bg-gold text-obsidian hover:bg-gold/90">{saving ? "Saving…" : member ? "Save changes" : "Create member"}</Button></div></form></DialogShell>;
}

function TermDialog({ state, memberships, error, saving, onOpenChange, onSubmit }) { if (!state) return null; const nextStart = state.term?.expiry_date ? addDays(state.term.expiry_date, 1) : today(); return <DialogShell open={state} onOpenChange={(open) => !open && onOpenChange(null)} title="Renew membership" description={`Create a new membership term for ${state.member.full_name}.`}><form onSubmit={onSubmit} className="space-y-4"><Error error={error} /><Field label="Plan"><select name="membership_id" required className="h-9 w-full rounded-md border border-white/15 bg-obsidian px-3 text-sm"><option value="">Select a plan</option>{memberships.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Start date"><Input name="start_date" type="date" defaultValue={nextStart} required /></Field><Field label="Expiry date"><Input name="expiry_date" type="date" required /></Field></div><Field label="Internal note"><textarea name="notes" className="min-h-20 w-full rounded-md border border-white/15 bg-transparent p-3 text-sm" /></Field><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(null)}>Cancel</Button><Button disabled={saving} className="bg-gold text-obsidian hover:bg-gold/90">{saving ? "Saving…" : "Create term"}</Button></div></form></DialogShell>; }

function FreezeDialog({ state, error, saving, onOpenChange, onSubmit }) { if (!state) return null; return <DialogShell open={state} onOpenChange={(open) => !open && onOpenChange(null)} title="Add approved freeze" description={`The membership expiry will extend by the approved number of frozen days.`}><form onSubmit={onSubmit} className="space-y-4"><Error error={error} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Start date"><Input name="start_date" type="date" defaultValue={EMPTY_FREEZE.start_date} required /></Field><Field label="End date"><Input name="end_date" type="date" defaultValue={EMPTY_FREEZE.end_date} required /></Field></div><Field label="Reason / note"><textarea name="reason" className="min-h-20 w-full rounded-md border border-white/15 bg-transparent p-3 text-sm" placeholder="Optional internal note" /></Field><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(null)}>Cancel</Button><Button disabled={saving} className="bg-gold text-obsidian hover:bg-gold/90">{saving ? "Saving…" : "Approve freeze"}</Button></div></form></DialogShell>; }
