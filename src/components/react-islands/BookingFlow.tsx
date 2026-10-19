import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { getSession } from "@/lib/auth-client";
import {
  addBooking,
  bookingDays,
  courtAvailable,
  COURT_IDS,
  MAINTENANCE_COURT_IDS,
  readBookings,
  type StoredBooking,
  timeSlots,
} from "@/lib/booking-demo";
import { useLocale } from "@/lib/use-locale";
import { cn, withBase } from "@/lib/utils";

type Step = "date" | "time" | "court" | "confirm" | "success";
type Tab = "book" | "list";

const STEPS: Step[] = ["date", "time", "court", "confirm"];

function formatDate(iso: string, locale: "en" | "zh", style: "short" | "long" = "long") {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(locale === "zh" ? "zh-Hant-TW" : "en-US", {
    weekday: style === "long" ? "short" : undefined,
    month: style === "long" ? "short" : "numeric",
    day: "numeric",
  });
}

function stepIndex(step: Step) {
  const i = STEPS.indexOf(step);
  return i >= 0 ? i : STEPS.length;
}

export default function BookingFlow() {
  const { t, locale } = useLocale();
  const [tab, setTab] = useState<Tab>("book");
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [courtId, setCourtId] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [confirmed, setConfirmed] = useState<StoredBooking | null>(null);
  const [sessionPhone, setSessionPhone] = useState<string | null>(null);

  const refreshBookings = useCallback(() => setBookings(readBookings()), []);

  useEffect(() => {
    refreshBookings();
    const session = getSession();
    if (session) setSessionPhone(`+${session.dialCode} ${session.phone}`);
  }, [refreshBookings]);

  const days = useMemo(() => bookingDays(), []);
  const slots = useMemo(() => timeSlots(), []);

  const resetFlow = () => {
    setStep("date");
    setDate("");
    setTime("");
    setCourtId(null);
    setGuestName("");
    setConfirmed(null);
  };

  const goBack = () => {
    if (step === "time") setStep("date");
    else if (step === "court") setStep("time");
    else if (step === "confirm") setStep("court");
  };

  const confirmBooking = () => {
    if (!date || !time || courtId == null) return;
    const label =
      guestName.trim() ||
      sessionPhone ||
      t("booking.guestDefault");
    const booking = addBooking({ date, time, courtId, guestLabel: label });
    setConfirmed(booking);
    refreshBookings();
    setStep("success");
  };

  const progress = step === "success" ? STEPS.length : stepIndex(step);

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile pb-stack-xl pt-stack-md md:px-margin-desktop md:pt-stack-lg">
      <header className="mb-stack-md text-center md:mb-stack-lg">
        <span className="mb-2 block font-sans text-label-sm font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
          {t("booking.eyebrow")}
        </span>
        <h1 className="font-display text-headline-lg-mobile uppercase text-primary md:text-display-md">{t("booking.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl font-sans text-body-md font-light text-on-surface-variant">{t("booking.subtitle")}</p>
        <p className="mt-4 inline-block border border-primary/30 bg-primary-container/40 px-4 py-2 font-sans text-label-sm text-on-primary-container">
          {t("booking.demoBadge")}
        </p>
      </header>

      {!sessionPhone && tab === "book" && step !== "success" && (
        <div className="mb-stack-md flex flex-col items-start justify-between gap-3 border border-outline-variant/50 bg-surface-container-low px-4 py-3 sm:flex-row sm:items-center">
          <p className="font-sans text-body-md text-on-surface-variant">{t("booking.loginHint")}</p>
          <a
            href={withBase("/login")}
            className="shrink-0 font-display text-headline-sm uppercase tracking-widest text-primary underline-offset-4 hover:underline"
          >
            {t("header.login")}
          </a>
        </div>
      )}

      <div className="mb-stack-md flex gap-2 border-b border-outline-variant/40">
        <TabButton active={tab === "book"} onClick={() => { setTab("book"); if (tab === "list") setStep("date"); }}>
          {t("booking.tab.new")}
        </TabButton>
        <TabButton active={tab === "list"} onClick={() => { setTab("list"); setStep("date"); }}>
          {t("booking.tab.my")}
        </TabButton>
      </div>

      {tab === "list" ? (
        <MyBookingsList bookings={bookings} locale={locale} t={t} onBook={() => { setTab("book"); resetFlow(); }} />
      ) : step === "success" && confirmed ? (
        <SuccessPanel
          booking={confirmed}
          locale={locale}
          t={t}
          onAnother={() => { resetFlow(); setTab("book"); }}
          onViewList={() => { setTab("list"); setStep("date"); }}
        />
      ) : (
        <>
          <StepIndicator
            labels={[t("booking.step.date"), t("booking.step.time"), t("booking.step.court"), t("booking.step.confirm")]}
            current={progress}
          />

          <div className="border border-outline-variant/40 bg-surface-container-lowest p-margin-mobile md:p-8">
            {step === "date" && (
              <>
                <SectionTitle icon={Calendar}>{t("booking.pickDate")}</SectionTitle>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                  {days.map((iso) => (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => { setDate(iso); setTime(""); setCourtId(null); setStep("time"); }}
                      className={cn(
                        "min-h-[4.5rem] border px-2 py-3 text-left transition-colors",
                        date === iso
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant/50 bg-surface hover:border-primary/50",
                      )}
                    >
                      <span className="block font-sans text-label-sm uppercase text-inherit opacity-80">
                        {formatDate(iso, locale, "short").split(",")[0]}
                      </span>
                      <span className="block font-display text-headline-sm uppercase">{formatDate(iso, locale)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "time" && (
              <>
                <SectionTitle icon={Clock}>{t("booking.pickTime")}</SectionTitle>
                <p className="mb-4 font-sans text-body-md text-on-surface-variant">
                  {t("booking.selectedDate")}: <strong>{formatDate(date, locale)}</strong>
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {slots.map((slot) => {
                    const anyCourt = COURT_IDS.some((id) => courtAvailable(id, date, slot, bookings));
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!anyCourt}
                        onClick={() => { setTime(slot); setCourtId(null); setStep("court"); }}
                        className={cn(
                          "border py-3 font-display text-headline-sm uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                          time === slot
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant/50 bg-surface hover:border-primary/50",
                        )}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <BackRow onBack={goBack} label={t("booking.back")} />
              </>
            )}

            {step === "court" && (
              <>
                <SectionTitle icon={MapPin}>{t("booking.pickCourt")}</SectionTitle>
                <p className="mb-4 font-sans text-body-md text-on-surface-variant">
                  {formatDate(date, locale)} · {time}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {COURT_IDS.map((id) => {
                    const maint = MAINTENANCE_COURT_IDS.has(id);
                    const available = courtAvailable(id, date, time, bookings);
                    const taken = !maint && !available;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!available}
                        onClick={() => { setCourtId(id); setStep("confirm"); }}
                        className={cn(
                          "flex flex-col items-start border p-4 text-left transition-colors disabled:cursor-not-allowed",
                          courtId === id
                            ? "border-primary bg-primary text-on-primary"
                            : available
                              ? "border-outline-variant/50 bg-surface hover:border-primary/50"
                              : "border-outline-variant/30 bg-surface-container opacity-60",
                        )}
                      >
                        <span className="font-display text-headline-sm uppercase">
                          {t("booking.courtLabel", { n: id })}
                        </span>
                        <span className="mt-1 font-sans text-label-sm">
                          {maint
                            ? t("booking.courtMaint")
                            : taken
                              ? t("booking.courtTaken")
                              : t("booking.courtOpen")}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <BackRow onBack={goBack} label={t("booking.back")} />
              </>
            )}

            {step === "confirm" && courtId != null && (
              <>
                <SectionTitle icon={Check}>{t("booking.summaryTitle")}</SectionTitle>
                <dl className="mt-4 space-y-3 font-sans text-body-md">
                  <Row label={t("booking.field.date")} value={formatDate(date, locale)} />
                  <Row label={t("booking.field.time")} value={time} />
                  <Row label={t("booking.field.court")} value={t("booking.courtLabel", { n: courtId })} />
                  {sessionPhone && <Row label={t("booking.field.member")} value={sessionPhone} />}
                </dl>
                {!sessionPhone && (
                  <label className="mt-6 block">
                    <span className="mb-2 block font-sans text-label-sm uppercase tracking-wide text-on-surface-variant">
                      {t("booking.guestName")}
                    </span>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={t("booking.guestNamePlaceholder")}
                      className="w-full border border-outline-variant/60 bg-surface px-4 py-3 font-sans text-body-md outline-none focus:border-primary"
                    />
                  </label>
                )}
                <div className="mt-stack-md flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center justify-center gap-2 border border-outline-variant px-6 py-3 font-display text-headline-sm uppercase tracking-widest text-on-surface"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                    {t("booking.back")}
                  </button>
                  <button
                    type="button"
                    onClick={confirmBooking}
                    className="inline-flex flex-1 items-center justify-center gap-2 bg-primary px-6 py-3 font-display text-headline-sm uppercase tracking-widest text-on-primary transition-opacity hover:opacity-90"
                  >
                    {t("booking.confirmCta")}
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-b-2 px-4 py-3 font-display text-headline-sm uppercase tracking-widest transition-colors",
        active ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface",
      )}
    >
      {children}
    </button>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-headline-sm uppercase tracking-wide text-primary md:text-headline-lg">
      <Icon className="size-5 shrink-0" aria-hidden />
      {children}
    </h2>
  );
}

function StepIndicator({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="mb-stack-md flex flex-wrap gap-2">
      {labels.map((label, i) => (
        <li
          key={label}
          className={cn(
            "flex items-center gap-2 border px-3 py-1.5 font-sans text-label-sm uppercase tracking-wide",
            i <= current ? "border-primary/40 bg-primary-container/30 text-on-primary-container" : "border-outline-variant/40 text-on-surface-variant",
          )}
        >
          <span className="font-semibold">{i + 1}</span>
          <span className="hidden sm:inline">{label}</span>
        </li>
      ))}
    </ol>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-outline-variant/30 pb-2">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="font-medium text-on-surface">{value}</dd>
    </div>
  );
}

function BackRow({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mt-6 inline-flex items-center gap-2 font-display text-headline-sm uppercase tracking-widest text-primary"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </button>
  );
}

function SuccessPanel({
  booking,
  locale,
  t,
  onAnother,
  onViewList,
}: {
  booking: StoredBooking;
  locale: "en" | "zh";
  t: ReturnType<typeof useLocale>["t"];
  onAnother: () => void;
  onViewList: () => void;
}) {
  return (
    <div className="border border-primary/30 bg-primary-container/50 p-margin-mobile text-center md:p-10">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary text-on-primary">
        <Check className="size-8" aria-hidden />
      </div>
      <h2 className="font-display text-headline-lg uppercase text-primary md:text-display-md">{t("booking.successTitle")}</h2>
      <p className="mt-2 font-sans text-body-md text-on-primary-container">{t("booking.successMessage")}</p>
      <p className="mt-4 font-mono text-label-sm text-on-surface-variant">{t("booking.refLabel")}: {booking.id.toUpperCase()}</p>
      <dl className="mx-auto mt-6 max-w-md space-y-2 text-left font-sans text-body-md">
        <Row label={t("booking.field.date")} value={formatDate(booking.date, locale)} />
        <Row label={t("booking.field.time")} value={booking.time} />
        <Row label={t("booking.field.court")} value={t("booking.courtLabel", { n: booking.courtId })} />
      </dl>
      <div className="mt-stack-md flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAnother}
          className="bg-primary px-8 py-4 font-display text-headline-sm uppercase tracking-widest text-on-primary"
        >
          {t("booking.bookAnother")}
        </button>
        <button
          type="button"
          onClick={onViewList}
          className="border border-primary px-8 py-4 font-display text-headline-sm uppercase tracking-widest text-primary"
        >
          {t("booking.viewMyBookings")}
        </button>
      </div>
    </div>
  );
}

function MyBookingsList({
  bookings,
  locale,
  t,
  onBook,
}: {
  bookings: StoredBooking[];
  locale: "en" | "zh";
  t: ReturnType<typeof useLocale>["t"];
  onBook: () => void;
}) {
  if (bookings.length === 0) {
    return (
      <div className="border border-outline-variant/40 bg-surface-container-lowest p-10 text-center">
        <p className="font-sans text-body-lg text-on-surface-variant">{t("booking.emptyList")}</p>
        <button
          type="button"
          onClick={onBook}
          className="mt-6 bg-primary px-8 py-4 font-display text-headline-sm uppercase tracking-widest text-on-primary"
        >
          {t("booking.tab.new")}
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li
          key={b.id}
          className="flex flex-col gap-2 border border-outline-variant/40 bg-surface-container-lowest p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-headline-sm uppercase text-primary">
              {t("booking.courtLabel", { n: b.courtId })} · {b.time}
            </p>
            <p className="font-sans text-body-md text-on-surface-variant">{formatDate(b.date, locale)}</p>
            <p className="font-sans text-label-sm text-on-surface-variant">{b.guestLabel}</p>
          </div>
          <span className="self-start border border-primary/30 bg-primary-container/40 px-3 py-1 font-sans text-label-sm uppercase tracking-wide text-on-primary-container sm:self-center">
            {t("booking.statusConfirmed")}
          </span>
        </li>
      ))}
    </ul>
  );
}
