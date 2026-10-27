import { useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const LIST_SEPARATOR = /[\n,]+/;

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function valueForField(record, field) {
  const value = record?.[field.name];
  if (field.type === "list") return Array.isArray(value) ? value.join("\n") : "";
  if (field.type === "checkbox") return value === true;
  return value ?? field.defaultValue ?? "";
}

function payloadFromForm(form, fields) {
  const payload = {};
  for (const field of fields) {
    if (field.type === "checkbox") {
      payload[field.name] = form.get(field.name) === "on";
      continue;
    }

    const raw = String(form.get(field.name) || "").trim();
    if (field.type === "number") payload[field.name] = raw === "" ? undefined : Number(raw);
    else if (field.type === "list") payload[field.name] = raw ? raw.split(LIST_SEPARATOR).map((item) => item.trim()).filter(Boolean) : [];
    else if (field.type === "slug") payload[field.name] = slugify(raw);
    else payload[field.name] = raw;
  }
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function displayValue(record, column) {
  const value = record?.[column.name];
  if (column.format) return column.format(value, record);
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value ?? "—";
}

export default function ContentManager({ entityName, label, items, fields, columns, publicPath = null, onChange }) {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0) || String(a.title || a.name || "").localeCompare(String(b.title || b.name || ""))),
    [items],
  );

  const openCreate = () => {
    setError("");
    setEditing({ isNew: true, is_published: false });
  };

  const openEdit = (item) => {
    setError("");
    setEditing({ ...item, isNew: false });
  };

  const save = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = payloadFromForm(form, fields);
    if (payload.slug && items.some((item) => item.id !== editing.id && item.slug === payload.slug)) {
      setError("That slug is already in use.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editing.isNew) {
        const created = await base44.entities[entityName].create(payload);
        onChange([...items, created]);
      } else {
        const updated = await base44.entities[entityName].update(editing.id, payload);
        onChange(items.map((item) => item.id === editing.id ? { ...item, ...payload, ...updated } : item));
      }
      setEditing(null);
    } catch (cause) {
      setError(cause.message || `Could not save ${label.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const name = item.title || item.name || item.slug;
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    try {
      await base44.entities[entityName].delete(item.id);
      onChange(items.filter((candidate) => candidate.id !== item.id));
    } catch (cause) {
      window.alert(cause.message || `Could not delete ${label.toLowerCase()}.`);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <h2 className="font-heading text-xl text-white">{label}</h2>
          <p className="text-xs text-white/40">Unpublished records stay out of public listings.</p>
        </div>
        <Button onClick={openCreate} className="bg-gold text-obsidian hover:bg-gold/90"><Plus /> Add</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-white/10">{columns.map((column) => <th key={column.name} className="p-3 text-left text-[10px] uppercase tracking-wide text-white/40">{column.label}</th>)}<th className="p-3 text-right text-[10px] uppercase tracking-wide text-white/40">Actions</th></tr></thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.id} className="border-b border-white/5 text-sm">
                {columns.map((column) => <td key={column.name} className="max-w-xs p-3 text-white/65">{displayValue(item, column)}</td>)}
                <td className="p-3"><div className="flex justify-end gap-1">
                  {publicPath && item.slug && <Button asChild size="icon" variant="ghost" title="Open public page"><Link to={publicPath(item)}><ExternalLink /></Link></Button>}
                  <Button size="icon" variant="ghost" title="Edit" onClick={() => openEdit(item)}><Pencil /></Button>
                  <Button size="icon" variant="ghost" title="Delete" onClick={() => remove(item)}><Trash2 /></Button>
                </div></td>
              </tr>
            ))}
            {sortedItems.length === 0 && <tr><td colSpan={columns.length + 1} className="p-10 text-center text-white/35">No {label.toLowerCase()} configured.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/15 bg-obsidian text-white">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? `Add ${label}` : `Edit ${label}`}</DialogTitle>
            <DialogDescription className="text-white/50">Save as unpublished until the content and business details are approved.</DialogDescription>
          </DialogHeader>
          {editing && <form onSubmit={save} className="space-y-4">
            {error && <p className="rounded bg-red-500/15 p-3 text-sm text-red-300" role="alert">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => <Field key={field.name} field={field} record={editing} />)}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button disabled={saving} className="bg-gold text-obsidian hover:bg-gold/90">{saving ? "Saving…" : "Save"}</Button>
            </div>
          </form>}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ field, record }) {
  const value = valueForField(record, field);
  const wrapperClass = field.fullWidth || field.type === "textarea" || field.type === "list" ? "sm:col-span-2" : "";
  const commonClass = "w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white";

  return (
    <label className={`space-y-1.5 text-sm text-white/70 ${wrapperClass}`}>
      <span>{field.label}{field.required ? " *" : ""}</span>
      {field.type === "textarea" || field.type === "list" ? (
        <textarea name={field.name} defaultValue={value} required={field.required} rows={field.rows || (field.type === "list" ? 4 : 7)} className={commonClass} placeholder={field.type === "list" ? "One item per line" : field.placeholder} />
      ) : field.type === "select" ? (
        <select name={field.name} defaultValue={value} required={field.required} className={`${commonClass} bg-obsidian`}>
          <option value="">Select…</option>
          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : field.type === "checkbox" ? (
        <span className="flex h-9 items-center gap-2"><input name={field.name} type="checkbox" defaultChecked={Boolean(value)} className="accent-[#D4AF37]" /> {field.help || field.label}</span>
      ) : (
        <Input name={field.name} type={field.type === "slug" ? "text" : field.type || "text"} defaultValue={value} required={field.required} min={field.min} className="border-white/15 bg-transparent text-white" placeholder={field.placeholder} />
      )}
      {field.help && field.type !== "checkbox" && <span className="block text-xs text-white/35">{field.help}</span>}
    </label>
  );
}

const publishField = { name: "is_published", label: "Published", type: "checkbox", help: "Visible on the public website" };
const seoFields = [
  { name: "seo_title", label: "SEO title" },
  { name: "seo_description", label: "SEO description", type: "textarea", rows: 3 },
];

export const CONTENT_CONFIG = {
  classes: {
    entityName: "FitnessClass", label: "Class catalogue",
    columns: [{ name: "name", label: "Name" }, { name: "category", label: "Category" }, { name: "difficulty", label: "Level" }, { name: "is_published", label: "Published" }],
    fields: [
      { name: "name", label: "Name", required: true }, { name: "slug", label: "Slug", type: "slug", required: true },
      { name: "category", label: "Category", required: true }, { name: "difficulty", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "All Levels"] },
      { name: "duration_minutes", label: "Default duration (minutes)", type: "number", min: 1 },
      { name: "default_studio", label: "Default studio", type: "select", options: ["aerobics", "spinning", "martial_arts", "floor"] },
      { name: "default_access_types", label: "Default access codes", type: "list", help: "Use: all, prepaid, ladies_only and/or kids" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_url", label: "Image URL" }, publishField, ...seoFields,
    ],
  },
  trainers: {
    entityName: "Trainer", label: "Trainers", publicPath: (item) => `/trainers/${item.slug}`,
    columns: [{ name: "name", label: "Name" }, { name: "title", label: "Title" }, { name: "specializations", label: "Specializations" }, { name: "is_published", label: "Published" }],
    fields: [
      { name: "name", label: "Name", required: true }, { name: "slug", label: "Slug", type: "slug", required: true },
      { name: "title", label: "Professional title" }, { name: "photo_url", label: "Photo URL" },
      { name: "years_experience", label: "Years of experience", type: "number", min: 0 }, { name: "display_order", label: "Display order", type: "number", defaultValue: 0 },
      { name: "certifications", label: "Certifications", type: "list" }, { name: "languages", label: "Languages", type: "list" },
      { name: "specializations", label: "Specializations", type: "list" }, { name: "expertise_areas", label: "Expertise areas", type: "list" },
      { name: "client_focus", label: "Client focus", type: "list" }, { name: "training_categories", label: "Training categories", type: "list" },
      { name: "philosophy", label: "Training philosophy", type: "textarea" }, { name: "bio", label: "Biography", type: "textarea" },
      { name: "availability", label: "Availability" }, { name: "instagram_url", label: "Instagram URL" },
      { name: "is_featured", label: "Featured", type: "checkbox", help: "Feature on the homepage" }, publishField, ...seoFields,
    ],
  },
  memberships: {
    entityName: "Membership", label: "Memberships", publicPath: () => "/memberships",
    columns: [{ name: "name", label: "Name" }, { name: "price", label: "Price" }, { name: "duration", label: "Duration" }, { name: "is_published", label: "Published" }],
    fields: offerFields("duration"),
  },
  passes: {
    entityName: "Pass", label: "Passes", publicPath: (item) => `/passes/${item.slug}`,
    columns: [{ name: "name", label: "Name" }, { name: "price", label: "Price" }, { name: "days", label: "Days" }, { name: "is_published", label: "Published" }],
    fields: offerFields("days"),
  },
  articles: {
    entityName: "Article", label: "Articles", publicPath: (item) => `/${item.section}/${item.slug}`,
    columns: [{ name: "title", label: "Title" }, { name: "section", label: "Section" }, { name: "category", label: "Category" }, { name: "is_published", label: "Published" }],
    fields: [
      { name: "title", label: "Title", required: true }, { name: "slug", label: "Slug", type: "slug", required: true },
      { name: "section", label: "Section", type: "select", required: true, options: ["blog", "fitness-guides", "workouts", "fitness-tips"] },
      { name: "category", label: "Category" }, { name: "excerpt", label: "Excerpt", type: "textarea", rows: 3 },
      { name: "content", label: "Content (Markdown)", type: "textarea", rows: 16, required: true }, { name: "cover_image_url", label: "Cover image URL" },
      { name: "author_name", label: "Author name" }, { name: "trainer_id", label: "Trainer ID" },
      { name: "difficulty", label: "Difficulty" }, { name: "duration_minutes", label: "Duration (minutes)", type: "number", min: 0 },
      { name: "goal", label: "Goal", type: "textarea", rows: 3 }, { name: "published_date", label: "Published date", type: "date" },
      { name: "equipment", label: "Equipment", type: "list" }, { name: "target_muscle_groups", label: "Target muscle groups", type: "list" },
      { name: "tags", label: "Tags", type: "list" }, { name: "is_featured", label: "Featured", type: "checkbox", help: "Feature on the homepage" },
      publishField, ...seoFields,
    ],
  },
  pages: {
    entityName: "SitePage", label: "Website pages", publicPath: (item) => `/${item.slug}`,
    columns: [{ name: "title", label: "Title" }, { name: "slug", label: "Slug" }, { name: "is_published", label: "Published" }],
    fields: [
      { name: "title", label: "Title", required: true }, { name: "slug", label: "Slug", type: "select", required: true, options: ["about", "facilities", "privacy", "terms"] },
      { name: "content", label: "Content (Markdown)", type: "textarea", rows: 18, required: true }, publishField, ...seoFields,
    ],
  },
};

function offerFields(durationField) {
  return [
    { name: "name", label: "Name", required: true }, { name: "slug", label: "Slug", type: "slug", required: true },
    { name: "price", label: "Price", type: "number", min: 0, required: true }, { name: "currency", label: "Currency", defaultValue: "EGP", required: true },
    durationField === "days" ? { name: "days", label: "Days", type: "number", min: 1, required: true } : { name: "duration", label: "Duration", required: true },
    { name: "display_order", label: "Display order", type: "number", defaultValue: 0 }, { name: "tagline", label: "Tagline" },
    { name: "description", label: "Description", type: "textarea", required: true }, { name: "recommended_for", label: "Recommended for" },
    { name: "benefits", label: "Benefits", type: "list" }, { name: "restrictions", label: "Restrictions", type: "list" },
    { name: "image_url", label: "Image URL" }, { name: "is_featured", label: "Featured", type: "checkbox", help: "Highlight this offer" },
    publishField, ...seoFields,
  ];
}
