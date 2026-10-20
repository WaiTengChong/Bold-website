import type { ClubNewsArticle } from "@/lib/news-data";
import type { MessageKey } from "@/lib/i18n";
import { cn, withBase } from "@/lib/utils";

type Translate = (key: MessageKey) => string;

type NewsCardProps = {
  article: ClubNewsArticle;
  t: Translate;
  imageSrc?: string;
  variant: "hero" | "side" | "grid";
  detailHref?: string;
};

function CategoryPill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block bg-primary-container px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary-container sm:text-label-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}

export default function NewsCard({ article, t, imageSrc, variant, detailHref }: NewsCardProps) {
  const src = imageSrc ?? article.imageSrc;
  const title = t(article.keys.title);
  const excerpt = t(article.keys.excerpt);
  const category = t(article.keys.category);
  const readMore = t(article.keys.readMore);
  const storyHref = detailHref ?? withBase(`/news#${article.id}`);

  if (variant === "hero") {
    return (
      <article className="flex h-full flex-col overflow-hidden border border-[#E5E7EB] bg-surface-container-low">
        <div className="relative h-56 overflow-hidden sm:h-64 md:h-80">
          <img
            src={src}
            alt={t(article.imageAltKey)}
            className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
            style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
            width={1200}
            height={800}
            loading="lazy"
          />
          <span className="absolute top-4 left-4 bg-primary px-3 py-1 font-sans text-label-sm font-semibold uppercase text-on-primary">
            {t(article.keys.date)}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-10">
          <CategoryPill label={category} />
          <h3 className="mt-3 font-display text-headline-sm uppercase text-primary md:text-headline-lg">{title}</h3>
          <p className="mt-3 font-sans text-body-md font-light leading-relaxed text-on-surface-variant">{excerpt}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <a
              href={storyHref}
              className="inline-flex border border-primary px-6 py-2.5 font-sans text-label-md font-medium uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-on-primary"
            >
              {readMore}
            </a>
            <a
              href={article.ctaHref}
              className="inline-flex px-2 py-2.5 font-sans text-label-sm font-semibold uppercase tracking-wide text-primary underline underline-offset-4"
            >
              {t(article.keys.cta)}
            </a>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "side") {
    return (
      <article className="flex min-w-0 flex-col overflow-hidden border border-[#E5E7EB] bg-surface-container-lowest sm:flex-row">
        <div className="relative h-40 shrink-0 overflow-hidden sm:h-auto sm:w-2/5">
          <img
            src={src}
            alt={t(article.imageAltKey)}
            className="h-full w-full object-cover"
            style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
            width={640}
            height={400}
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill label={category} />
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant sm:text-label-sm">
              {t(article.keys.date)}
            </p>
          </div>
          <h3 className="mt-2 font-display text-headline-sm uppercase leading-tight text-primary">{title}</h3>
          <p className="mt-2 line-clamp-3 font-sans text-body-md font-light text-on-surface-variant">{excerpt}</p>
          <a
            href={storyHref}
            className="mt-4 inline-flex self-start font-sans text-label-sm font-semibold uppercase tracking-wide text-primary underline underline-offset-4"
          >
            {readMore}
          </a>
        </div>
      </article>
    );
  }

  return (
    <article
      id={article.id}
      className="flex h-full scroll-mt-24 flex-col overflow-hidden border border-[#E5E7EB] bg-surface-container-lowest"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={src}
          alt={t(article.imageAltKey)}
          className="h-full w-full object-cover"
          style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
          width={800}
          height={440}
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-primary px-2.5 py-0.5 font-sans text-label-sm font-semibold uppercase text-on-primary">
          {t(article.keys.date)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <CategoryPill label={category} />
        <h3 className="mt-2 font-display text-headline-sm uppercase text-primary">{title}</h3>
        <p className="mt-3 font-sans text-body-md font-light text-on-surface-variant">{excerpt}</p>
        <details className="group mt-4 border-t border-outline-variant/30 pt-4">
          <summary className="cursor-pointer list-none font-sans text-label-sm font-semibold uppercase tracking-wide text-primary marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="underline underline-offset-4 group-open:no-underline">{readMore}</span>
          </summary>
          <p className="mt-3 font-sans text-body-md font-light leading-relaxed text-on-surface-variant">{t(article.keys.body)}</p>
          <a
            href={article.ctaHref}
            className="mt-4 inline-flex border border-primary px-5 py-2 font-sans text-label-sm font-medium uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-on-primary"
          >
            {t(article.keys.cta)}
          </a>
        </details>
      </div>
    </article>
  );
}
