import type { MessageKey } from "@/lib/i18n";

export const PHONE_DIAL_CODES = [
  { value: "852", labelKey: "phone.dial.852" as MessageKey },
  { value: "853", labelKey: "phone.dial.853" as MessageKey },
  { value: "86", labelKey: "phone.dial.86" as MessageKey },
] as const;

export const DEFAULT_DIAL_CODE = "852";

export type DialCode = (typeof PHONE_DIAL_CODES)[number]["value"];