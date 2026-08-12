export const PHONE_DIAL_CODES = [
  { value: "852", label: "+852 HK" },
  { value: "853", label: "+853 MO" },
  { value: "86", label: "+86 CN" },
] as const;

export const DEFAULT_DIAL_CODE = "852";

export type DialCode = (typeof PHONE_DIAL_CODES)[number]["value"];
