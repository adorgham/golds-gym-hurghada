import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LOCALES, SUPPORTED_LOCALES } from "@/lib/localization";
import {
  PAGE_BLOCK_TYPES,
  PAGE_EDITION_STATUSES,
  PAGE_IDENTITY_OPTIONS,
  editionBlocksToMarkdown,
  editionIdentity,
  isLanguageEdition,
  normalizeEditionBlocks,
} from "@/lib/pageEditions";

const pageOrder = new Map(PAGE_IDENTITY_OPTIONS.map((page, index) => [page.value, index]));
const localeOrder = new Map(SUPPORTED_LOCALES.map((locale, index) => [locale, index]));
const EMPTY_ITEMS = Object.freeze([]);

function createBlock(type = "rich_text") {
  const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return { block_key: `block-${suffix}`, type, heading: "", body: "", cta_label: "", cta_url: "" };
}

function workflowLabel(status) {
  return String(status || "draft").replace(/_/g, " ");
}

function statusClass(status) {
  if (status === "published") return "bg-green-500/15 text-green-300";
  if (status === "approved") return "bg-blue-500/15 text-blue-300";
  if (status === "review") return "bg-amber-500/15 text-amber-300";
  return "bg-white/10 text-white/55";
}

export default function LanguageEditionManager({ items = EMPTY_ITEMS, user, onChange }) {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editions = useMemo(
    () => items
      .filter(isLanguageEdition)
      .sort((a, b) => (pageOrder.get(a.page_key) - pageOrder.get(b.page_key)) || (localeOrder.get(a.locale) - localeOrder.get(b.locale))),
    [items],
  );

  const openCreate = () => {
    setError("");
    setEditing({
      ...editionIdentity("home", "en"),
      title: "",
      navigation_label: "",
      hero_eyebrow: "",
      hero_heading: "",
      hero_body: "",
      primary_cta_label: "",
      primary_cta_url: "",
      content_blocks: [createBlock()],
      seo_title: "",
      seo_description: "",
      workflow_status: "draft",
      editorial_notes: "",
      source_reference: "",
      version: 1,
      isNew: true,
    });
  };

  const openEdit = (item) => {
    setError("");
    setEditing({
      ...item,
      ...editionIdentity(item.page_key, item.locale),
      workflow_status: item.workflow_status || (item.is_published ? "published" : "draft"),
      content_blocks: normalizeEditionBlocks(item.content_blocks),
      isNew: false,
    });
  };

  const updateField = (name, value) => setEditing((current) => ({ ...current, [name]: value }));

  const updateIdentity = (name, value) => {
    setEditing((current) => {
      const pageKey = name === "page_key" ? value : current.page_key;
      const locale = name === "locale" ? value : current.locale;
      return { ...current, ...editionIdentity(pageKey, locale) };
    });
  };

  const updateBlock = (index, name, value) => {
    setEditing((current) => ({
      ...current,
      content_blocks: current.content_blocks.map((block, blockIndex) => blockIndex === index ? { ...block, [name]: value } : block),
    }));
  };

  const moveBlock = (index, delta) => {
    setEditing((current) => {
      const destination = index + delta;
      if (destination < 0 || destination >= current.content_blocks.length) return current;
      const blocks = [...current.content_blocks];
      [blocks[index], blocks[destination]] = [blocks[destination], blocks[index]];
      return { ...current, content_blocks: blocks };
    });
  };

  const removeBlock = (index) => setEditing((current) => ({
    ...current,
    content_blocks: current.content_blocks.filter((_, blockIndex) => blockIndex !== index),
  }));

  const save = async (event) => {
    event.preventDefault();
    const blocks = normalizeEditionBlocks(editing.content_blocks);
    const status = editing.workflow_status || "draft";
    const duplicate = editions.find((item) => item.id !== editing.id && item.page_key === editing.page_key && item.locale === editing.locale);

    if (duplicate) {
      setError(`${LOCALES[editing.locale].label} already has a ${editing.page_key.replace(/_/g, " ")} edition.`);
      return;
    }
    if (!editing.title.trim() || !editing.hero_heading.trim()) {
      setError("Edition title and hero heading are required.");
      return;
    }
    if (blocks.length === 0) {
      setError("Add at least one content block before saving the edition.");
      return;
    }
    if (["approved", "published"].includes(status) && (!editing.seo_title.trim() || !editing.seo_description.trim())) {
      setError("Approved and published editions require an SEO title and description.");
      return;
    }

    const now = new Date().toISOString();
    const identity = editionIdentity(editing.page_key, editing.locale);
    const payload = {
      ...identity,
      title: editing.title.trim(),
      navigation_label: editing.navigation_label.trim(),
      hero_eyebrow: editing.hero_eyebrow.trim(),
      hero_heading: editing.hero_heading.trim(),
      hero_body: editing.hero_body.trim(),
      primary_cta_label: editing.primary_cta_label.trim(),
      primary_cta_url: editing.primary_cta_url.trim(),
      content_blocks: blocks,
      content: editionBlocksToMarkdown(blocks),
      seo_title: editing.seo_title.trim(),
      seo_description: editing.seo_description.trim(),
      workflow_status: status,
      editorial_notes: editing.editorial_notes.trim(),
      source_reference: editing.source_reference.trim(),
      version: editing.isNew ? 1 : Number(editing.version || 1) + 1,
      is_published: status === "published",
      ...(status === "approved" || status === "published" ? {
        approved_by: user?.email || user?.full_name || user?.id || "admin",
        approved_at: now,
      } : {}),
      ...(status === "published" ? { published_at: editing.published_at || now } : {}),
    };

    setSaving(true);
    setError("");
    try {
      if (editing.isNew) {
        const created = await base44.entities.SitePage.create(payload);
        onChange([...items, created]);
      } else {
        const updated = await base44.entities.SitePage.update(editing.id, payload);
        onChange(items.map((item) => item.id === editing.id ? { ...item, ...payload, ...updated } : item));
      }
      setEditing(null);
    } catch (cause) {
      setError(cause.message || "Could not save the language edition.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete the ${LOCALES[item.locale].label} “${item.title}” edition? This cannot be undone.`)) return;
    try {
      await base44.entities.SitePage.delete(item.id);
      onChange(items.filter((candidate) => candidate.id !== item.id));
    } catch (cause) {
      window.alert(cause.message || "Could not delete the language edition.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <h2 className="font-heading text-xl text-white">Language editions</h2>
          <p className="text-xs text-white/40">Independent EN, AR, DE and RU editions. Publishing never changes canonical prices, trainers or schedules.</p>
        </div>
        <Button onClick={openCreate} className="bg-gold text-obsidian hover:bg-gold/90"><Plus /> Add edition</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-white/10">
            {['Page', 'Language', 'Title', 'Path', 'Blocks', 'Version', 'Status'].map((label) => <th key={label} className="p-3 text-left text-[10px] uppercase tracking-wide text-white/40">{label}</th>)}
            <th className="p-3 text-right text-[10px] uppercase tracking-wide text-white/40">Actions</th>
          </tr></thead>
          <tbody>
            {editions.map((item) => (
              <tr key={item.id} className="border-b border-white/5 text-sm">
                <td className="p-3 text-white/70">{PAGE_IDENTITY_OPTIONS.find((page) => page.value === item.page_key)?.label}</td>
                <td className="p-3 text-white/70"><span dir={item.direction}>{LOCALES[item.locale]?.label}</span></td>
                <td className="max-w-xs p-3 text-white">{item.title}</td>
                <td className="p-3 font-mono text-xs text-white/45">{item.path}</td>
                <td className="p-3 text-white/55">{normalizeEditionBlocks(item.content_blocks).length}</td>
                <td className="p-3 text-white/55">v{item.version || 1}</td>
                <td className="p-3"><span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClass(item.workflow_status || (item.is_published ? "published" : "draft"))}`}>{workflowLabel(item.workflow_status || (item.is_published ? "published" : "draft"))}</span></td>
                <td className="p-3"><div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" title="Edit edition" onClick={() => openEdit(item)}><Pencil /></Button>
                  <Button size="icon" variant="ghost" title="Delete edition" onClick={() => remove(item)}><Trash2 /></Button>
                </div></td>
              </tr>
            ))}
            {editions.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-white/35">No language editions configured. Import remains blocked until approved drafts are reviewed.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[94vh] max-w-5xl overflow-y-auto border-white/15 bg-obsidian text-white">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? "Add language edition" : "Edit language edition"}</DialogTitle>
            <DialogDescription className="text-white/50">Each edition is independent. Dynamic blocks read shared canonical records and do not copy commercial facts.</DialogDescription>
          </DialogHeader>

          {editing && <form onSubmit={save} className="space-y-6">
            {error && <p className="rounded bg-red-500/15 p-3 text-sm text-red-300" role="alert">{error}</p>}

            <section className="grid gap-4 border border-white/10 p-4 sm:grid-cols-2">
              <SelectField label="Page identity" value={editing.page_key} options={PAGE_IDENTITY_OPTIONS} onChange={(value) => updateIdentity("page_key", value)} />
              <SelectField label="Language" value={editing.locale} options={SUPPORTED_LOCALES.map((locale) => ({ value: locale, label: LOCALES[locale].label }))} onChange={(value) => updateIdentity("locale", value)} />
              <ReadOnlyField label="Edition key" value={editing.edition_key} />
              <ReadOnlyField label="Canonical path" value={editing.path} />
            </section>

            <section className="grid gap-4 sm:grid-cols-2" dir={editing.direction}>
              <TextField label="CMS title" value={editing.title} required onChange={(value) => updateField("title", value)} />
              <TextField label="Navigation label" value={editing.navigation_label} onChange={(value) => updateField("navigation_label", value)} />
              <TextField label="Hero eyebrow" value={editing.hero_eyebrow} onChange={(value) => updateField("hero_eyebrow", value)} />
              <TextField label="Hero heading" value={editing.hero_heading} required onChange={(value) => updateField("hero_heading", value)} />
              <TextAreaField label="Hero body" value={editing.hero_body} rows={4} onChange={(value) => updateField("hero_body", value)} />
              <div className="grid content-start gap-4 sm:grid-cols-2">
                <TextField label="Primary CTA label" value={editing.primary_cta_label} onChange={(value) => updateField("primary_cta_label", value)} />
                <TextField label="Primary CTA path" value={editing.primary_cta_url} onChange={(value) => updateField("primary_cta_url", value)} />
              </div>
            </section>

            <section className="space-y-3 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="font-heading text-lg">Edition content blocks</h3><p className="text-xs text-white/40">Order and content may differ completely between languages.</p></div>
                <Button type="button" variant="outline" onClick={() => updateField("content_blocks", [...editing.content_blocks, createBlock()])}><Plus /> Add block</Button>
              </div>

              {editing.content_blocks.map((block, index) => (
                <div key={block.block_key} className="space-y-4 border border-white/10 p-4" dir={editing.direction}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Block {index + 1}</span>
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" disabled={index === 0} title="Move up" onClick={() => moveBlock(index, -1)}><ArrowUp /></Button>
                      <Button type="button" size="icon" variant="ghost" disabled={index === editing.content_blocks.length - 1} title="Move down" onClick={() => moveBlock(index, 1)}><ArrowDown /></Button>
                      <Button type="button" size="icon" variant="ghost" title="Remove block" onClick={() => removeBlock(index)}><Trash2 /></Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="Block type" value={block.type} options={PAGE_BLOCK_TYPES} onChange={(value) => updateBlock(index, "type", value)} />
                    <TextField label={block.type === "faq" ? "Question" : "Heading"} value={block.heading} onChange={(value) => updateBlock(index, "heading", value)} />
                    <TextAreaField label={block.type === "faq" ? "Answer" : "Body (Markdown)"} value={block.body} rows={5} onChange={(value) => updateBlock(index, "body", value)} />
                    <div className="grid content-start gap-4 sm:grid-cols-2">
                      <TextField label="Block CTA label" value={block.cta_label} onChange={(value) => updateBlock(index, "cta_label", value)} />
                      <TextField label="Block CTA path" value={block.cta_url} onChange={(value) => updateBlock(index, "cta_url", value)} />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2" dir={editing.direction}>
              <TextField label="SEO title" value={editing.seo_title} onChange={(value) => updateField("seo_title", value)} />
              <TextAreaField label="SEO description" value={editing.seo_description} rows={3} onChange={(value) => updateField("seo_description", value)} />
              <SelectField label="Workflow status" value={editing.workflow_status} options={PAGE_EDITION_STATUSES.map((status) => ({ value: status, label: workflowLabel(status) }))} onChange={(value) => updateField("workflow_status", value)} />
              <TextField label="Source reference" value={editing.source_reference} onChange={(value) => updateField("source_reference", value)} />
              <TextAreaField label="Editorial notes" value={editing.editorial_notes} rows={3} onChange={(value) => updateField("editorial_notes", value)} />
              <ReadOnlyField label="Version after save" value={`v${editing.isNew ? 1 : Number(editing.version || 1) + 1}`} />
            </section>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-4" dir="ltr">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button disabled={saving} className="bg-gold text-obsidian hover:bg-gold/90">{saving ? "Saving…" : "Save edition"}</Button>
            </div>
          </form>}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SelectField({ label, value, options, onChange }) {
  return <label className="space-y-1.5 text-sm text-white/70"><span>{label}</span><select value={value || ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-white/15 bg-obsidian px-3 py-2 text-sm text-white">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function TextField({ label, value, required = false, onChange }) {
  return <label className="space-y-1.5 text-sm text-white/70"><span>{label}{required ? " *" : ""}</span><Input value={value || ""} required={required} onChange={(event) => onChange(event.target.value)} className="border-white/15 bg-transparent text-white" /></label>;
}

function TextAreaField({ label, value, rows, onChange }) {
  return <label className="space-y-1.5 text-sm text-white/70"><span>{label}</span><textarea value={value || ""} rows={rows} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white" /></label>;
}

function ReadOnlyField({ label, value }) {
  return <label className="space-y-1.5 text-sm text-white/70"><span>{label}</span><Input value={value || ""} readOnly className="border-white/10 bg-white/[0.03] font-mono text-xs text-white/50" /></label>;
}
