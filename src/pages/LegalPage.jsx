import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import ContentState from "@/components/ContentState";
import { isPublished } from "@/lib/content";
import { absoluteUrl, useSeo, breadcrumbsLd } from "@/lib/seo";

export default function LegalPage({
  slug: slugProp,
  defaultTitle,
  defaultDescription,
  pendingTitle,
}) {
  const { slug: slugParam } = useParams();
  const slug = slugProp || slugParam;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    base44.entities.SitePage.filter({ slug })
      .then((records) => setPage(records.find(isPublished) || null))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useSeo({
    title: page?.seo_title || page?.title || defaultTitle || (slug === "privacy" ? "Privacy Policy" : "Terms and Conditions"),
    description: page?.seo_description || defaultDescription || `Gold's Gym Hurghada ${slug === "privacy" ? "privacy policy" : "terms and conditions"}.`,
    canonical: `/${slug}`,
    noindex: !page,
    jsonLd: breadcrumbsLd([
      { name: "Home", url: absoluteUrl("/") },
      { name: page?.title || slug, url: absoluteUrl(`/${slug}`) },
    ]),
  });

  if (loading) return <div className="min-h-[60vh] px-5 pt-36 text-white/40">Loading…</div>;

  return (
    <main className="min-h-[60vh] px-5 pb-24 pt-36 lg:px-10">
      <div className="mx-auto max-w-3xl">
        {!page ? (
          <ContentState
            title={failed ? "This page is temporarily unavailable" : pendingTitle || "Content pending approval"}
            message="Approved content has not been published yet. Please contact the gym if you need this information now."
          />
        ) : (
          <>
            <h1 className="font-heading text-5xl text-white">{page.title}</h1>
            <div className="prose-content mt-10 text-white/75"><ReactMarkdown>{page.content}</ReactMarkdown></div>
          </>
        )}
      </div>
    </main>
  );
}
