import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/auth-client";
import { withBase } from "@/lib/utils";

type Props = {
  className: string;
};

export default function AdminNavLink({ className }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isAdmin());
  }, []);

  if (!show) return null;

  return (
    <a href={withBase("/console")} className={className}>
      Admin
    </a>
  );
}
