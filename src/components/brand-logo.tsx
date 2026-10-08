import Link from "next/link";
export default function BrandLogo({ href = "/fr" }: { href?: string }) {
  return (
    <Link
      className="wordmark brand-logo"
      href={href}
      dir="ltr"
      aria-label="WZNI · وزني"
    >
      <span className="brand-latin">wzni</span>
      <span className="brand-arabic" lang="ar">
        وزني
      </span>
      <i aria-hidden="true" />
    </Link>
  );
}
