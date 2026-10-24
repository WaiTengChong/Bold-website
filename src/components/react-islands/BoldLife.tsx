import { useEffect, useState } from "react";
import { loadSiteContent, type GalleryImage } from "@/lib/site-content";
import { useLocale } from "@/lib/use-locale";

export default function BoldLife() {
  const { t } = useLocale();
  const [images, setImages] = useState<GalleryImage[]>(() => loadSiteContent().gallery);

  useEffect(() => {
    setImages(loadSiteContent().gallery);
  }, []);

  return (
    <section id="life" className="border-t border-outline-variant/30 bg-tertiary py-stack-lg md:py-stack-xl">
      <div className="mb-stack-md flex flex-col gap-2 px-margin-mobile sm:flex-row sm:items-end sm:justify-between md:px-margin-desktop">
        <h2 className="bold-section-title text-on-tertiary">{t("life.title")}</h2>
        <span className="truncate font-sans text-label-md text-on-tertiary-container">@BOLDPICKLEBALL</span>
      </div>
      <div className="grid grid-cols-3 gap-0.5 px-0.5 sm:gap-1 sm:px-1">
        {images.map((image) => (
          <div key={image.alt} className="aspect-square overflow-hidden bg-surface-container-high">
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover grayscale"
              style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
              width={800}
              height={800}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
