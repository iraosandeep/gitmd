import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const VIDEO_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

// Sanitize schema extended to keep inline video (and its <source>/<track>
// children) that GitHub authors embed as raw HTML in Markdown.
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "video", "source", "track"],
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), "loading", "width", "height", "align"],
    video: [
      "src",
      "poster",
      "controls",
      "autoplay",
      "loop",
      "muted",
      "playsinline",
      "preload",
      "width",
      "height",
      "align",
    ],
    source: ["src", "type", "media"],
    track: ["src", "kind", "srclang", "label", "default"],
  },
};

function resolveRelative(base: string, href: string) {
  const baseDir = base.includes("/") ? base.slice(0, base.lastIndexOf("/")) : "";
  const segs = (baseDir ? `${baseDir}/${href}` : href).split("/");
  const out: string[] = [];
  for (const s of segs) {
    if (s === "." || s === "") continue;
    if (s === "..") out.pop();
    else out.push(s);
  }
  return out.join("/");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function nodeText(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(nodeText).join("");
  const el = children as { props?: { children?: ReactNode } };
  return el.props ? nodeText(el.props.children) : "";
}

function scrollToAnchor(hash: string) {
  if (!hash) return;
  requestAnimationFrame(() => {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function MarkdownView({
  content,
  currentPath,
  rawBase,
  files,
  owner,
  repo,
  onNavigate,
}: {
  content: string;
  currentPath: string;
  rawBase: string;
  files: string[];
  owner?: string;
  repo?: string;
  onNavigate: (path: string) => void;
}) {
  const matchFile = (candidate: string) =>
    files.find((f) => f === candidate) ??
    files.find((f) => f === `${candidate}/README.md`) ??
    files.find((f) => f.toLowerCase() === candidate.toLowerCase());

  const heading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
    function Heading({ children, node: _n, ...rest }: any) {
      const id = slugify(nodeText(children));
      return (
        <Tag id={id} {...rest}>
          {children}
        </Tag>
      );
    };

  // Resolve a Markdown media src to a fully-qualified URL: rewrite github.com
  // blob/raw page links to raw.githubusercontent.com and resolve repo-relative
  // paths against the current file.
  const toMediaUrl = (raw: string) => {
    const s = typeof raw === "string" ? raw : "";
    if (/^https?:/i.test(s)) {
      const m = s.match(
        /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/i,
      );
      return m ? `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}` : s;
    }
    return `${rawBase}/${resolveRelative(currentPath, s)}`;
  };

  return (
    <article className="prose-read reader-images">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{
          h1: heading("h1"),
          h2: heading("h2"),
          h3: heading("h3"),
          h4: heading("h4"),
          h5: heading("h5"),
          h6: heading("h6"),
          a: ({ href, children, node: _n, ...rest }: any) => {
            const target = typeof href === "string" ? href : "";

            // A link straight to a video file becomes an inline player.
            if (VIDEO_RE.test(target)) {
              return <video src={toMediaUrl(target)} controls playsInline preload="metadata" />;
            }

            // Same-page anchor
            if (target.startsWith("#")) {
              const hash = target.slice(1);
              return (
                <a
                  href={target}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToAnchor(hash);
                  }}
                  {...rest}
                >
                  {children}
                </a>
              );
            }

            // Absolute GitHub URL pointing at this same repo
            if (owner && repo && /^https?:\/\/(www\.)?github\.com\//i.test(target)) {
              try {
                const url = new URL(target);
                const parts = url.pathname.split("/").filter(Boolean);
                if (
                  parts[0]?.toLowerCase() === owner.toLowerCase() &&
                  parts[1]?.toLowerCase() === repo.toLowerCase()
                ) {
                  let rest2 = parts.slice(2);
                  if (rest2[0] === "blob" || rest2[0] === "tree") rest2 = rest2.slice(2);
                  const path = rest2.join("/");
                  const hash = decodeURIComponent(url.hash.slice(1));
                  const match = path ? matchFile(path) : currentPath;
                  if (match) {
                    return (
                      <a
                        href={`/${owner}/${repo}/${match}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (match !== currentPath) onNavigate(match);
                          scrollToAnchor(hash);
                        }}
                        {...rest}
                      >
                        {children}
                      </a>
                    );
                  }
                }
              } catch {
                /* fall through to external */
              }
            }

            const isExternal = /^(https?:|mailto:)/i.test(target);
            if (!isExternal && target) {
              const [cleanRaw, hashRaw] = target.split("#");
              const clean = cleanRaw ?? "";
              const resolved = resolveRelative(currentPath, clean);
              const match = matchFile(resolved);
              if (match) {
                return (
                  <a
                    href={owner && repo ? `/${owner}/${repo}/${match}` : `#${match}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (match !== currentPath) onNavigate(match);
                      scrollToAnchor(hashRaw ? decodeURIComponent(hashRaw) : "");
                    }}
                    {...rest}
                  >
                    {children}
                  </a>
                );
              }
            }
            return (
              <a href={target} target="_blank" rel="noreferrer noopener" {...rest}>
                {children}
              </a>
            );
          },
          img: ({ src, alt, node: _node, ...rest }: any) => {
            const full = toMediaUrl(src);
            // A Markdown image that points at a video file (e.g. ![demo](demo.mp4))
            // renders as an inline player. Animated GIFs stay as <img>.
            if (VIDEO_RE.test(full)) {
              return (
                <video src={full} controls playsInline preload="metadata" aria-label={alt ?? ""} />
              );
            }
            return <img src={full} alt={alt ?? ""} loading="lazy" {...rest} />;
          },
          video: ({ src, node: _node, children, ...rest }: any) => {
            const full = src ? toMediaUrl(src) : undefined;
            return (
              <video {...rest} {...(full ? { src: full } : {})} controls playsInline>
                {children}
              </video>
            );
          },
          source: ({ src, node: _node, ...rest }: any) => {
            const full = src ? toMediaUrl(src) : undefined;
            return <source {...rest} {...(full ? { src: full } : {})} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
