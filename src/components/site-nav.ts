export const NAV_ITEMS = [
  { href: "/", label: "About" },
  { href: "/people", label: "People" },
  { href: "/business", label: "Business" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
] as const;

export type NavHref = (typeof NAV_ITEMS)[number]["href"];
