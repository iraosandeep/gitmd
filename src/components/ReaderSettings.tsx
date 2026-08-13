import { Check, ChevronRight, RotateCcw, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_BOLD } from "@/hooks/use-bold-text";
import { useGitHubToken } from "@/hooks/use-github-token";
import { DEFAULT_FONT, FONT_LIST } from "@/hooks/use-reader-font";
import { DEFAULT_SIZE, SIZE_MAX, SIZE_MIN, SIZE_STEP } from "@/hooks/use-reader-size";
import { DEFAULT_THEME, THEME_LIST, type Theme } from "@/hooks/use-theme";

type Props = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  font: string;
  setFont: (f: string) => void;
  bold: boolean;
  setBold: (b: boolean) => void;
  size: number;
  setSize: (s: number) => void;
  grain: boolean;
  setGrain: (g: boolean) => void;
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
  grain,
  setGrain,
}: Props) {
  const { token: githubToken } = useGitHubToken();

  const reset = () => {
    setTheme(DEFAULT_THEME);
    setFont(DEFAULT_FONT);
    setBold(DEFAULT_BOLD);
    setSize(DEFAULT_SIZE);
    setGrain(true);
  };

  return (
    <Popover>
      <PopoverTrigger
        className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="size-3.5" />
        <span className="text-[0.7rem] uppercase tracking-widest">Settings</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-76 space-y-5 paper-grain"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* GitHub token */}
        <Link
          to="/settings/github-token"
          className="flex items-center justify-between rounded-sm border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-secondary"
        >
          <span className="min-w-0">
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              GitHub token
            </span>
            <span className="block text-sm text-foreground">
              {githubToken ? "Saved — higher rate limit active" : "Not set — optional"}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>

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
                    style={{ fontWeight: 500 }}
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
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Text size
            </p>
            <span className="text-[0.7rem] text-muted-foreground">
              {Math.round((size / DEFAULT_SIZE) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">A</span>
            <Slider
              value={[size]}
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={SIZE_STEP}
              onValueChange={([next]) => setSize(next!)}
              aria-label="Text size"
            />
            <span className="text-lg text-muted-foreground">A</span>
          </div>
        </section>

        {/* Bold text */}
        <section className="flex items-center justify-between">
          <label htmlFor="bold-text" className="text-sm text-foreground">
            Bold text
          </label>
          <Switch id="bold-text" checked={bold} onCheckedChange={setBold} />
        </section>

        {/* Paper texture */}
        <section className="flex items-center justify-between">
          <label htmlFor="paper-texture" className="text-sm text-foreground">
            Paper texture
          </label>
          <Switch id="paper-texture" checked={grain} onCheckedChange={setGrain} />
        </section>

        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-border bg-card py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset to defaults
        </button>
      </PopoverContent>
    </Popover>
  );
}
