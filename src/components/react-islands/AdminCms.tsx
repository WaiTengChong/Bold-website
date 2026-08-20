import { useEffect, useState } from "react";
import {
  fileToDataUrl,
  loadSiteContent,
  newNewsId,
  resetSiteContent,
  saveSiteContent,
  type GalleryImage,
  type NewsItem,
  type SideEvent,
  type SiteContent,
} from "@/lib/site-content";

type Tab = "photos" | "events" | "news";

const fieldClass =
  "w-full border-b border-primary bg-transparent py-2 font-label-md text-label-md text-primary outline-none";

export default function AdminCms() {
  const [tab, setTab] = useState<Tab>("photos");
  const [draft, setDraft] = useState<SiteContent>(() => loadSiteContent());
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(loadSiteContent());
  }, []);

  const save = () => {
    saveSiteContent(draft);
    setError("");
    setStatus("Saved — open the homepage in this browser to preview.");
  };

  const reset = () => {
    setDraft(resetSiteContent());
    setError("");
    setStatus("Reset to site defaults.");
  };

  const replaceSrc = async (file: File | undefined, apply: (src: string) => void) => {
    if (!file) return;
    try {
      const src = await fileToDataUrl(file);
      apply(src);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <section className="space-y-stack-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
            SITE CONTENT
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Photos, events, and news on the public homepage. Stored in this browser only.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="border border-outline px-4 py-2 font-label-sm text-label-sm tracking-widest text-outline uppercase"
            onClick={reset}
          >
            Reset
          </button>
          <button
            type="button"
            className="bg-primary px-4 py-2 font-label-sm text-label-sm tracking-widest text-on-primary uppercase"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>

      {error && (
        <p className="border border-error/40 bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
          {error}
        </p>
      )}
      {status && !error && (
        <p className="border border-outline-variant bg-surface-container-low px-4 py-3 font-label-md text-label-md text-primary">
          {status}
        </p>
      )}

      <div className="flex gap-2 border-b border-outline-variant">
        {(["photos", "events", "news"] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={`px-4 py-2 font-label-sm text-label-sm tracking-widest uppercase ${
              tab === id ? "border-b-2 border-primary text-primary" : "text-outline"
            }`}
            onClick={() => setTab(id)}
          >
            {id}
          </button>
        ))}
      </div>

      {tab === "photos" && (
        <div className="space-y-stack-sm">
          <ImageEditor
            label="Hero"
            image={{ src: draft.hero.imageSrc, alt: draft.hero.imageAlt }}
            onChange={(next) => setDraft({ ...draft, hero: { imageSrc: next.src, imageAlt: next.alt } })}
            onFile={(file) => replaceSrc(file, (imageSrc) => setDraft({ ...draft, hero: { ...draft.hero, imageSrc } }))}
          />
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
            {draft.gallery.map((image, index) => (
              <ImageEditor
                key={index}
                label={`Bold Life ${index + 1}`}
                image={image}
                onChange={(next) => {
                  const gallery = draft.gallery.slice();
                  gallery[index] = next;
                  setDraft({ ...draft, gallery });
                }}
                onFile={(file) =>
                  replaceSrc(file, (src) => {
                    const gallery = draft.gallery.slice();
                    gallery[index] = { ...gallery[index], src };
                    setDraft({ ...draft, gallery });
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-stack-sm">
          <div className="space-y-3 border border-outline-variant bg-surface-container-lowest p-stack-md">
            <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">Featured event</p>
            <label className="block">
              <span className="font-label-sm text-label-sm text-outline uppercase">Date</span>
              <input
                className={fieldClass}
                value={draft.featured.date}
                onChange={(e) => setDraft({ ...draft, featured: { ...draft.featured, date: e.target.value } })}
              />
            </label>
            <label className="block">
              <span className="font-label-sm text-label-sm text-outline uppercase">Title</span>
              <input
                className={fieldClass}
                value={draft.featured.title}
                onChange={(e) => setDraft({ ...draft, featured: { ...draft.featured, title: e.target.value } })}
              />
            </label>
            <label className="block">
              <span className="font-label-sm text-label-sm text-outline uppercase">Description</span>
              <textarea
                className={`${fieldClass} min-h-24 normal-case`}
                value={draft.featured.description}
                onChange={(e) => setDraft({ ...draft, featured: { ...draft.featured, description: e.target.value } })}
              />
            </label>
            <ImageEditor
              label="Event image"
              image={{ src: draft.featured.imageSrc, alt: draft.featured.imageAlt }}
              onChange={(next) =>
                setDraft({ ...draft, featured: { ...draft.featured, imageSrc: next.src, imageAlt: next.alt } })
              }
              onFile={(file) =>
                replaceSrc(file, (imageSrc) => setDraft({ ...draft, featured: { ...draft.featured, imageSrc } }))
              }
            />
          </div>
          {draft.sideEvents.map((event, index) => (
            <div key={event.id} className="space-y-3 border border-outline-variant bg-surface-container-lowest p-stack-md">
              <div className="flex items-center justify-between">
                <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">Side event {index + 1}</p>
                <label className="flex items-center gap-2 font-label-sm text-label-sm uppercase">
                  <input
                    type="checkbox"
                    checked={event.visible}
                    onChange={(e) => patchSide(draft, setDraft, index, { visible: e.target.checked })}
                  />
                  Show
                </label>
              </div>
              <input
                className={fieldClass}
                value={event.title}
                onChange={(e) => patchSide(draft, setDraft, index, { title: e.target.value })}
              />
              <input
                className={fieldClass}
                value={event.meta}
                onChange={(e) => patchSide(draft, setDraft, index, { meta: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}

      {tab === "news" && (
        <div className="space-y-stack-sm">
          {draft.news.map((item, index) => (
            <div key={item.id} className="space-y-3 border border-outline-variant bg-surface-container-lowest p-stack-md">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 font-label-sm text-label-sm uppercase">
                  <input
                    type="checkbox"
                    checked={item.published}
                    onChange={(e) => patchNews(draft, setDraft, index, { published: e.target.checked })}
                  />
                  Published
                </label>
                <button
                  type="button"
                  className="font-label-sm text-label-sm tracking-widest text-error uppercase"
                  onClick={() => setDraft({ ...draft, news: draft.news.filter((_, i) => i !== index) })}
                >
                  Remove
                </button>
              </div>
              <input
                className={fieldClass}
                value={item.title}
                onChange={(e) => patchNews(draft, setDraft, index, { title: e.target.value })}
              />
              <input
                className={fieldClass}
                value={item.date}
                onChange={(e) => patchNews(draft, setDraft, index, { date: e.target.value })}
              />
              <textarea
                className={`${fieldClass} min-h-20 normal-case`}
                value={item.body}
                onChange={(e) => patchNews(draft, setDraft, index, { body: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            className="border border-primary px-4 py-2 font-label-sm text-label-sm tracking-widest text-primary uppercase"
            onClick={() =>
              setDraft({
                ...draft,
                news: [
                  ...draft.news,
                  { id: newNewsId(), title: "New update", date: "TODAY", body: "", published: false },
                ],
              })
            }
          >
            Add news
          </button>
        </div>
      )}
    </section>
  );
}

function patchSide(
  draft: SiteContent,
  setDraft: (next: SiteContent) => void,
  index: number,
  patch: Partial<SideEvent>,
) {
  const sideEvents = draft.sideEvents.slice();
  sideEvents[index] = { ...sideEvents[index], ...patch };
  setDraft({ ...draft, sideEvents });
}

function patchNews(
  draft: SiteContent,
  setDraft: (next: SiteContent) => void,
  index: number,
  patch: Partial<NewsItem>,
) {
  const news = draft.news.slice();
  news[index] = { ...news[index], ...patch };
  setDraft({ ...draft, news });
}

function ImageEditor({
  label,
  image,
  onChange,
  onFile,
}: {
  label: string;
  image: GalleryImage;
  onChange: (next: GalleryImage) => void;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <div className="space-y-3 border border-outline-variant bg-surface-container-lowest p-stack-sm">
      <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">{label}</p>
      <img src={image.src} alt={image.alt} className="h-32 w-full object-cover" />
      <label className="block">
        <span className="font-label-sm text-label-sm text-outline uppercase">Alt text</span>
        <input className={fieldClass} value={image.alt} onChange={(e) => onChange({ ...image, alt: e.target.value })} />
      </label>
      <label className="block">
        <span className="font-label-sm text-label-sm text-outline uppercase">Image URL</span>
        <input className={fieldClass} value={image.src.startsWith("data:") ? "" : image.src} placeholder="https://… or /photos/…" onChange={(e) => onChange({ ...image, src: e.target.value })} />
      </label>
      <label className="block font-label-sm text-label-sm tracking-widest text-primary uppercase">
        Upload
        <input
          type="file"
          accept="image/*"
          className="mt-2 block text-on-surface-variant normal-case"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
