import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, Check, Copy, ImagePlus, Pencil, Search, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const EMPTY = { title: "", alt_text: "", is_decorative: false, caption: "", credit: "", tags: "" };

export default function MediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setAssets(await base44.entities.MediaAsset.list("-created_date").catch(() => []));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const visibleAssets = useMemo(() => assets.filter((asset) => {
    const matchesQuery = `${asset.title} ${asset.file_name} ${asset.alt_text} ${(asset.tags || []).join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const missingAlt = !asset.is_decorative && !asset.alt_text?.trim();
    return matchesQuery && (filter === "All" || (filter === "Missing alt text" && missingAlt) || asset.status === filter);
  }), [assets, filter, query]);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please select an image file.");
    setUploading(true); setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const dimensions = await imageDimensions(file);
      setEditing({ ...EMPTY, file_url, file_name: file.name, mime_type: file.type, ...dimensions, isNew: true });
    } catch (cause) { setError(cause.message || "Image upload failed."); } finally { setUploading(false); }
  };

  const save = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    const isDecorative = form.get("is_decorative") === "on";
    if (!isDecorative && !values.alt_text.trim()) return setError("Alt text is required unless this image is decorative.");
    const data = { ...editing, ...values, is_decorative: isDecorative, alt_text: isDecorative ? "" : values.alt_text.trim(), tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    delete data.isNew;
    setError("");
    try {
      if (editing.isNew) await base44.entities.MediaAsset.create({ ...data, status: "Active" });
      else await base44.entities.MediaAsset.update(editing.id, data);
      setEditing(null); await load();
    } catch (cause) { setError(cause.message || "Could not save this media asset."); }
  };

  const archive = async (asset) => {
    if (!window.confirm(`Archive “${asset.title}”? The original file is retained, but this asset will be removed from the active library.`)) return;
    await base44.entities.MediaAsset.update(asset.id, { status: "Archived" });
    await load();
  };

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-5">
      <div><h2 className="font-heading text-2xl text-white">MEDIA LIBRARY</h2><p className="mt-1 text-sm text-white/45">Reusable image assets with accessibility metadata.</p></div>
      <div><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} /><Button onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-gold text-obsidian hover:bg-gold/90"><Upload /> {uploading ? "Uploading…" : "Upload image"}</Button></div>
    </div>
    <div className="flex flex-wrap gap-3 p-5"><label className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media library" className="border-white/15 bg-white/5 pl-9 text-white" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-md border border-white/15 bg-obsidian px-3 text-sm text-white"><option>All</option><option>Missing alt text</option><option>Active</option><option>Archived</option></select></div>
    {error && <p className="mx-5 mb-4 rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}
    {loading ? <p className="p-8 text-center text-white/35">Loading media…</p> : <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visibleAssets.map((asset) => <AssetCard key={asset.id} asset={asset} onEdit={() => { setError(""); setEditing({ ...asset, tags: (asset.tags || []).join(", ") }); }} onArchive={() => archive(asset)} />)}{visibleAssets.length === 0 && <div className="col-span-full border border-dashed border-white/15 p-10 text-center text-white/40"><ImagePlus className="mx-auto mb-3 h-8 w-8" />No media assets found.</div>}</div>}
    <MediaDialog asset={editing} error={error} onOpenChange={(open) => !open && setEditing(null)} onSubmit={save} />
  </div>;
}

function AssetCard({ asset, onEdit, onArchive }) {
  const missingAlt = !asset.is_decorative && !asset.alt_text?.trim();
  const copyUrl = async () => { try { await navigator.clipboard.writeText(asset.file_url); } catch (_) { window.prompt("Copy this image URL", asset.file_url); } };
  return <article className="overflow-hidden border border-white/10 bg-white/[0.02]"><div className="relative aspect-square bg-black/30"><img src={asset.file_url} alt={asset.is_decorative ? "" : asset.alt_text || asset.title} className="h-full w-full object-cover" />{missingAlt && <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">ALT TEXT NEEDED</span>}{asset.status === "Archived" && <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">ARCHIVED</span>}</div><div className="p-3"><p className="truncate text-sm font-medium text-white">{asset.title}</p><p className="mt-1 line-clamp-2 text-xs text-white/45">{asset.is_decorative ? "Decorative image" : asset.alt_text || "Alt text missing"}</p><div className="mt-3 flex gap-1"><Button size="icon" variant="ghost" title="Copy image URL" onClick={copyUrl}><Copy /></Button><Button size="icon" variant="ghost" title="Edit media details" onClick={onEdit}><Pencil /></Button>{asset.status !== "Archived" && <Button size="icon" variant="ghost" title="Archive media" onClick={onArchive}><Archive /></Button>}</div></div></article>;
}

function MediaDialog({ asset, error, onOpenChange, onSubmit }) {
  if (!asset) return null;
  return <Dialog open={Boolean(asset)} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-obsidian text-white"><DialogHeader><DialogTitle>{asset.isNew ? "Describe uploaded image" : "Edit media asset"}</DialogTitle><DialogDescription className="text-white/50">Alt text describes meaningful images for screen-reader users. Decorative images use an intentionally empty alt value.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-4">{error && <p className="rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}<img src={asset.file_url} alt="" className="max-h-48 w-full rounded object-contain" /><Field label="Title"><Input name="title" defaultValue={asset.title} required /></Field><Field label="Alt text"><Input name="alt_text" defaultValue={asset.alt_text} placeholder="Describe what is meaningful in this image" /></Field><label className="flex items-center gap-2 text-sm text-white/70"><input name="is_decorative" type="checkbox" defaultChecked={asset.is_decorative} /> Decorative image — leave alt text empty</label><Field label="Caption"><textarea name="caption" defaultValue={asset.caption} className="min-h-16 w-full rounded-md border border-white/15 bg-transparent p-3 text-sm" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Credit"><Input name="credit" defaultValue={asset.credit} /></Field><Field label="Tags"><Input name="tags" defaultValue={asset.tags} placeholder="fitness, trainers" /></Field></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button className="bg-gold text-obsidian hover:bg-gold/90"><Check /> Save media</Button></div></form></DialogContent></Dialog>;
}
function Field({ label, children }) { return <label className="block text-sm text-white/70"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function imageDimensions(file) { return new Promise((resolve) => { const image = new Image(); image.onload = () => { resolve({ width: image.naturalWidth, height: image.naturalHeight }); URL.revokeObjectURL(image.src); }; image.onerror = () => resolve({}); image.src = URL.createObjectURL(file); }); }
