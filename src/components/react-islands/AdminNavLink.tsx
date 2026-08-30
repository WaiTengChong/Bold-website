import { useEffect, useState } from "react";
import { ensureAdminSeed, isAdmin } from "@/lib/auth-client";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

type Props = {
  className: string;
};

export default function AdminNavLink({ className }: Props) {
  const { t } = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    ensureAdminSeed();
    setShow(isAdmin());
  }, []);

  if (!show) return null;

  return (
    <a href={withBase("/admin")} className={className}>
      {t("header.admin")}
    </a>
  );
}
