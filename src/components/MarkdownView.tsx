import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

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
    function Heading({ children, ...rest }: { children?: ReactNode }) {
      const id = slugify(nodeText(children));
      return (
        <Tag id={id} {...rest}>
          {children}
        </Tag>
      );
    };

  return (
    <article className="prose-read reader-images">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: heading("h1"),
          h2: heading("h2"),
          h3: heading("h3"),
          h4: heading("h4"),
          h5: heading("h5"),
          h6: heading("h6"),
          a: ({ href, children, ...rest }) => {
            const target = typeof href === "string" ? href : "";

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
                        href={`#${match}`}
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
                    href={`#${match}`}
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
            const s = typeof src === "string" ? src : "";
            let full: string;
            if (/^https?:/i.test(s)) {
              // Rewrite github.com blob/raw page URLs to raw.githubusercontent.com
              const m = s.match(
                /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/i,
              );
              full = m ? `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}` : s;
            } else {
              full = `${rawBase}/${resolveRelative(currentPath, s)}`;
            }
            return <img src={full} alt={alt ?? ""} loading="lazy" {...rest} />;
          },

        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
