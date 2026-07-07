import { palette } from "@/lib/design/colors";

const swatches = [
  { name: "Navy", hex: palette.navy },
  { name: "Surface", hex: palette.surface },
  { name: "Coral", hex: palette.coral },
  { name: "Gold", hex: palette.gold },
  { name: "Live", hex: palette.live },
  { name: "Electric", hex: palette.electric },
  { name: "Snow", hex: palette.snow },
] as const;

export function PalettePreview() {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        Stadium Night palette
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {swatches.map((swatch) => (
          <div key={swatch.name} className="space-y-1.5 text-center">
            <div
              className="mx-auto size-10 rounded-xl border border-white/10 shadow-sm"
              style={{ backgroundColor: swatch.hex }}
            />
            <p className="text-[10px] font-medium text-muted-foreground">
              {swatch.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
