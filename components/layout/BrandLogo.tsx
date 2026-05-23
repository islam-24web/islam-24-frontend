import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  /** kept for API compatibility — tagline is already embedded in the logo image */
  tagline?: string | null;
  className?: string;
}

export default function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link href="/" className={`brand-logo ${className}`} aria-label="إسلام 24 — الرئيسية">
      <Image
        src="/images/logo.png"
        alt="إسلام 24 — حتى يغيروا ما بأنفسهم"
        width={1900}
        height={300}
        className="brand-logo-img"
        priority
      />
    </Link>
  );
}
