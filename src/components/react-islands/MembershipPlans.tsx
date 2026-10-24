import { Check } from "lucide-react";
import { useLocale } from "@/lib/use-locale";
import { cn, withBase } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n";

type PlanId = "club" | "pro" | "founding";

const PLANS: { id: PlanId; featured?: boolean; features: MessageKey[] }[] = [
  {
    id: "club",
    features: [
      "membership.plan.feature.courts5",
      "membership.plan.feature.events",
      "membership.plan.feature.recovery",
    ],
  },
  {
    id: "pro",
    featured: true,
    features: [
      "membership.plan.feature.courtsUnlimited",
      "membership.plan.feature.recovery",
      "membership.plan.feature.coaching",
      "membership.plan.feature.guest",
    ],
  },
  {
    id: "founding",
    features: [
      "membership.plan.feature.courtsUnlimited",
      "membership.plan.feature.recovery",
      "membership.plan.feature.concierge",
      "membership.plan.feature.coaching",
      "membership.plan.feature.guest",
      "membership.plan.feature.events",
    ],
  },
];

const PACKS: { nameKey: MessageKey; priceKey: MessageKey; detailKey: MessageKey }[] = [
  {
    nameKey: "membership.pack.sessions10.name",
    priceKey: "membership.pack.sessions10.price",
    detailKey: "membership.pack.sessions10.detail",
  },
  {
    nameKey: "membership.pack.unlimited.name",
    priceKey: "membership.pack.unlimited.price",
    detailKey: "membership.pack.unlimited.detail",
  },
];

function planKey(id: PlanId, field: "name" | "price" | "blurb"): MessageKey {
  return `membership.plan.${id}.${field}` as MessageKey;
}

export default function MembershipPlans() {
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile pb-stack-xl pt-stack-md md:px-margin-desktop md:pt-stack-lg">
      <header className="bold-page-header mb-stack-lg">
        <h1>{t("membership.page.title")}</h1>
        <p>{t("membership.page.subtitle")}</p>
        <p className="bold-demo-badge">{t("membership.page.demoNote")}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "flex flex-col border p-margin-mobile md:p-6",
              plan.featured
                ? "border-primary bg-primary-container shadow-sm md:-mt-2 md:mb-2"
                : "border-outline-variant/40 bg-surface-container-lowest",
            )}
          >
            <p className="font-sans text-label-sm uppercase tracking-[0.2em] text-on-surface-variant">{t("membership.page.monthly")}</p>
            <h2 className="mt-2 font-display text-headline-lg uppercase text-primary">{t(planKey(plan.id, "name"))}</h2>
            <p className="mt-1 font-sans text-body-md font-semibold text-on-surface">{t(planKey(plan.id, "price"))}</p>
            <p className="mt-2 font-sans text-body-md font-light text-on-surface-variant">{t(planKey(plan.id, "blurb"))}</p>
            <ul className="mt-6 flex-1 space-y-2">
              {plan.features.map((key) => (
                <li key={key} className="flex gap-2 font-sans text-body-md text-on-surface">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {t(key)}
                </li>
              ))}
            </ul>
            <div className="mt-stack-md flex flex-col gap-2">
              <a
                href={withBase("/signup")}
                className={cn(
                  "text-center px-6 py-3 font-display text-headline-sm uppercase tracking-widest transition-opacity hover:opacity-90",
                  plan.featured ? "bg-primary text-on-primary" : "border border-primary text-primary",
                )}
              >
                {t("membership.page.signupCta")}
              </a>
              <a
                href="mailto:hello@boldpickleball.demo"
                className="text-center font-sans text-label-sm uppercase tracking-wide text-on-surface-variant underline-offset-4 hover:underline"
              >
                {t("membership.page.contact")}
              </a>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-stack-xl">
        <h2 className="mb-stack-md text-center font-display text-headline-lg uppercase text-primary">{t("membership.page.packagesTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {PACKS.map((pack) => (
            <div
              key={pack.nameKey}
              className="border border-outline-variant/40 bg-surface-container-low p-margin-mobile md:p-6"
            >
              <h3 className="font-display text-headline-sm uppercase text-primary">{t(pack.nameKey)}</h3>
              <p className="mt-1 font-sans text-body-md font-semibold">{t(pack.priceKey)}</p>
              <p className="mt-2 font-sans text-body-md text-on-surface-variant">{t(pack.detailKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-stack-xl bg-primary-container px-margin-mobile py-stack-lg text-center md:px-margin-desktop">
        <h2 className="font-display text-headline-lg uppercase text-primary">{t("membership.page.compareTitle")}</h2>
        <p className="mx-auto mt-3 max-w-xl font-sans text-body-md text-on-primary-container">{t("membership.eyebrow")}</p>
        <ul className="mx-auto mt-6 max-w-md space-y-2 text-left font-sans text-body-md text-on-primary-container">
          <li data-i18n="membership.perk1">{t("membership.perk1")}</li>
          <li>{t("membership.perk2")}</li>
          <li>{t("membership.perk3")}</li>
          <li>{t("membership.perk4")}</li>
        </ul>
        <div className="mt-stack-md flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={withBase("/signup")}
            className="inline-flex bg-primary px-10 py-4 font-display text-headline-sm uppercase tracking-widest text-on-primary"
          >
            {t("membership.page.joinCta")}
          </a>
          <a
            href={withBase("/booking")}
            className="inline-flex border border-primary px-10 py-4 font-display text-headline-sm uppercase tracking-widest text-primary"
          >
            {t("membership.page.bookCta")}
          </a>
        </div>
      </section>
    </div>
  );
}
