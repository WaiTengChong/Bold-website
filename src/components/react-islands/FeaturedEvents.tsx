import { useEffect, useState } from "react";
import { loadSiteContent, visibleSideEvents, type SiteContent } from "@/lib/site-content";
import { withBase } from "@/lib/utils";

export default function FeaturedEvents() {
  const [content, setContent] = useState<SiteContent>(() => loadSiteContent());

  useEffect(() => {
    setContent(loadSiteContent());
  }, []);

  const { featured } = content;
  const sideEvents = visibleSideEvents(content);

  return (
    <section id="events" className="px-margin-mobile py-stack-lg md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-stack-md flex items-end justify-between">
          <h2 className="font-display text-headline-lg-mobile uppercase text-primary md:text-headline-lg">
            Featured Events
          </h2>
          <a
            href={withBase("/#events")}
            className="font-sans text-label-sm font-semibold uppercase text-primary-container underline underline-offset-4"
          >
            View All
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="flex flex-col overflow-hidden border border-[#E5E7EB] bg-surface-container-low">
            <div className="relative h-64 overflow-hidden">
              <img
                src={featured.imageSrc}
                alt={featured.imageAlt}
                className="h-full w-full object-cover object-[50%_15%] grayscale transition-all duration-700 hover:grayscale-0"
                width={1200}
                height={800}
                loading="lazy"
              />
              <span className="absolute top-4 left-4 bg-primary px-3 py-1 font-sans text-label-sm font-semibold uppercase text-on-primary">
                {featured.date}
              </span>
            </div>
            <div className="p-6 md:p-10">
              <h3 className="mb-2 font-display text-headline-sm uppercase text-primary">{featured.title}</h3>
              <p className="mb-4 font-sans text-body-md font-light text-on-surface-variant">{featured.description}</p>
              <a
                href={featured.ctaHref}
                className="inline-flex border border-primary px-6 py-2 font-sans text-label-md font-medium uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-on-primary"
              >
                {featured.ctaLabel}
              </a>
            </div>
          </article>

          <div className="grid grid-cols-1 content-start gap-6">
            {sideEvents.map((event) => (
              <article
                key={event.id}
                className="flex min-w-0 items-center gap-4 border border-[#E5E7EB] bg-surface-container-lowest p-4 sm:p-6"
              >
                <div
                  className={`flex size-16 shrink-0 items-center justify-center sm:size-20 ${
                    event.variant === "primary" ? "bg-primary" : "bg-primary-container"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-8 text-on-primary sm:size-10"
                    aria-hidden
                  >
                    {event.icon === "fitness_center" ? (
                      <>
                        <path d="M14.4 14.4 9.6 9.6" />
                        <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
                        <path d="m21.5 21.5-1.4-1.4" />
                        <path d="M3.9 3.9 2.5 2.5" />
                        <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
                      </>
                    ) : (
                      <>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </>
                    )}
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-headline-sm uppercase text-primary">{event.title}</h3>
                  <p className="truncate font-sans text-label-sm font-semibold uppercase text-on-surface-variant">
                    {event.meta}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
