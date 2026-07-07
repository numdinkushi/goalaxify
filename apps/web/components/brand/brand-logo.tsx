import Image from "next/image";

export function BrandLogo({ size = 88 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src="/assets/logo/logo.png"
        alt="Goalaxify"
        width={size}
        height={size}
        priority
        className="object-contain"
      />
    </div>
  );
}
