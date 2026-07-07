import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

type LogoLoaderProps = {
  message?: string;
  size?: number;
  className?: string;
};

export function LogoLoader({
  message = "Loading…",
  size = 72,
  className,
}: LogoLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="logo-loader-orbit">
        <div className="logo-loader-glow" aria-hidden />
        <BrandLogo size={size} />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
