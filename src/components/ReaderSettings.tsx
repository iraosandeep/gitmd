import { Check, Minus, Plus, Type } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { FONT_LIST, SIZES, THEME_LIST, type Theme } from "@/hooks/use-reader-prefs";

type Props = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  font: string;
  setFont: (f: string) => void;
  bold: boolean;
  setBold: (b: boolean) => void;
  size: number;
  setSize: (s: number) => void;
};

export function ReaderSettings({
  theme,
  setTheme,
  font,
  setFont,
  bold,
  setBold,
  size,
  setSize,
}: Props) {
  const sizeIndex = SIZES.indexOf(size as never);

  return (
    <Popover>
      <PopoverTrigger
        className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Reading settings"
        title="Reading settings"
      >
        <Type className="size-3.5" />
        <span className="text-[0.7rem] uppercase tracking-widest">Aa</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[19rem] space-y-5"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Theme grid */}
        <section>
          <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Theme
          </p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_LIST.map((t) => {
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  data-theme={t.id}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1 rounded-md border px-2 py-3 transition-all ${
                    selected
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
                >
                  <span
                    className="font-[family-name:var(--font-serif-read)] text-xl leading-none"
                    style={{ fontWeight: t.id === "bold" ? 700 : 500 }}
                  >
                    Aa
                  </span>
                  <span className="text-[0.65rem]" style={{ color: "var(--muted-foreground)" }}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Font */}
        <section>
          <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Font
          </p>
          <div className="flex flex-col gap-1">
            {FONT_LIST.map((f) => {
              const selected = font === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  aria-pressed={selected}
                  className={`flex items-center justify-between rounded-sm px-2.5 py-2 text-left transition-colors ${
                    selected ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
                  }`}
                  style={{ fontFamily: f.stack }}
                >
                  <span className="text-base">{f.label}</span>
                  {selected && <Check className="size-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Text size */}
        <section className="flex items-center justify-between">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Text size
          </p>
          <div className="flex items-center gap-0.5 rounded-sm border border-border bg-card p-0.5">
            <button
              onClick={() => setSize(SIZES[Math.max(0, sizeIndex - 1)]!)}
              disabled={sizeIndex <= 0}
              className="rounded-[3px] px-1.5 py-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              aria-label="Decrease text size"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="px-1 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              Aa
            </span>
            <button
              onClick={() => setSize(SIZES[Math.min(SIZES.length - 1, sizeIndex + 1)]!)}
              disabled={sizeIndex >= SIZES.length - 1}
              className="rounded-[3px] px-1.5 py-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              aria-label="Increase text size"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </section>

        {/* Bold text */}
        <section className="flex items-center justify-between">
          <label htmlFor="bold-text" className="text-sm text-foreground">
            Bold text
          </label>
          <Switch id="bold-text" checked={bold} onCheckedChange={setBold} />
        </section>
      </PopoverContent>
    </Popover>
  );
}
