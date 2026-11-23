import { useEffect, useState } from "react";
import { getMemberSession, isMemberLoggedIn, memberLogout } from "@/lib/auth-client";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

type Props = {
  className?: string;
  layout?: "desktop" | "compact";
};

function refreshMember(): boolean {
  return isMemberLoggedIn();
}

export default function HeaderAuthActions({ className = "", layout = "desktop" }: Props) {
  const { t } = useLocale();
  const [member, setMember] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const sync = () => {
      const loggedIn = refreshMember();
      setMember(loggedIn);
      if (loggedIn) {
        const s = getMemberSession();
        const label = [s?.surname, s?.givenName].filter(Boolean).join(" ").trim();
        setName(label || t("member.title"));
      } else {
        setName("");
      }
    };
    sync();
    window.addEventListener("bold-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bold-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [t]);

  const logout = () => {
    memberLogout();
    window.dispatchEvent(new Event("bold-auth-change"));
    window.location.href = withBase("/");
  };

  if (member) {
    return (
      <div className={`flex shrink-0 items-center gap-2 md:gap-3 ${className}`}>
        <a
          href={withBase("/account")}
          className={
            layout === "compact"
              ? "bold-btn-primary px-3 py-2 text-[13px]"
              : "hidden font-sans text-body-md font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-opacity hover:opacity-85 md:inline"
          }
          title={name}
        >
          {layout === "compact" ? t("header.accountShort") : t("header.account")}
        </a>
        <button
          type="button"
          onClick={logout}
          className={
            layout === "compact"
              ? "font-sans text-[13px] font-medium text-on-surface-variant"
              : "hidden font-sans text-body-md font-medium text-on-surface-variant transition-colors hover:text-primary md:inline"
          }
        >
          {t("header.logout")}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 items-center gap-2 md:gap-3 ${className}`}>
      <a
        href={withBase("/login")}
        className={
          layout === "compact"
            ? "font-sans text-[13px] font-medium text-on-surface-variant"
            : "hidden font-sans text-body-md font-medium text-on-surface-variant transition-colors hover:text-primary md:inline"
        }
      >
        {t("header.login")}
      </a>
      <a
        href={withBase("/signup")}
        className={
          layout === "compact"
            ? "bold-btn-primary px-3 py-2 text-[13px]"
            : "bold-btn-primary hidden md:inline-flex"
        }
      >
        {layout === "compact" ? t("menu.signup") : t("header.join")}
      </a>
    </div>
  );
}