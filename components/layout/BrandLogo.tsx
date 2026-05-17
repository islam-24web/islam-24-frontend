import Link from "next/link";

interface BrandLogoProps {
  tagline?: string | null;
  className?: string;
}

export default function BrandLogo({ tagline, className = "" }: BrandLogoProps) {
  return (
    <Link href="/" className={`brand-logo ${className}`} aria-label="islam-24">
      <span className="brand-logo-mark" aria-hidden="true">
        <span>24</span>
      </span>
      <span className="brand-logo-copy">
        <span className="brand-wordmark" dir="ltr">
          islam<span>-24</span>
        </span>
        {tagline && <span className="brand-tagline" dir="rtl">{tagline}</span>}
      </span>
    </Link>
  );
}
