export function isPublished(record) {
  return record?.is_published !== false;
}

export function publishedOnly(records) {
  return (records || []).filter(isPublished);
}

export function sectionLabel(section) {
  return String(section || "").replaceAll("-", " ");
}
