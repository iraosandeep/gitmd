import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GitMD — Read GitHub docs like a book" },
      {
        name: "description",
        content:
          "Turn any public GitHub repository's Markdown files into a calm, e-ink styled reading experience.",
      },
      { property: "og:title", content: "GitMD — Read GitHub docs like a book" },
      {
        property: "og:description",
        content:
          "Turn any public GitHub repository's Markdown files into a calm, e-ink styled reading experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Lora:wght@400;500;600&family=Inter:wght@400;500;600&family=Atkinson+Hyperlegible:wght@400;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const APPLY_READER_PREFS_SCRIPT = `(function(){
  try {
    var themes = ["original","paper","sepia","calm","focus","quiet","ink"];
    var t = localStorage.getItem("mdbook.theme");
    if (!t || themes.indexOf(t) === -1) t = "paper";
    document.documentElement.setAttribute("data-theme", t);

    var fonts = {
      literata: '"Literata", Georgia, "Times New Roman", serif',
      newsreader: '"Newsreader", Georgia, serif',
      lora: '"Lora", Georgia, serif',
      inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
      atkinson: '"Atkinson Hyperlegible", ui-sans-serif, system-ui, sans-serif',
      mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace'
    };
    var f = localStorage.getItem("mdbook.font");
    document.documentElement.style.setProperty("--reader-font", fonts[f] || fonts.literata);

    var s = parseFloat(localStorage.getItem("mdbook.size"));
    document.documentElement.style.setProperty("--reader-size", (s || 1.125) + "rem");

    document.documentElement.style.setProperty(
      "--reader-weight",
      localStorage.getItem("mdbook.bold") === "1" ? "500" : "400"
    );

    document.documentElement.setAttribute(
      "data-grain",
      localStorage.getItem("mdbook.grain") === "0" ? "off" : "on"
    );
  } catch (e) {}
})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPLY_READER_PREFS_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="paper-grain">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
