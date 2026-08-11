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

export function MarkdownView({
  content,
  currentPath,
  rawBase,
  files,
  onNavigate,
}: {
  content: string;
  currentPath: string;
  rawBase: string;
  files: string[];
  onNavigate: (path: string) => void;
}) {
  return (
    <article className="prose-read reader-images">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          a: ({ href, children, ...rest }) => {
            const target = typeof href === "string" ? href : "";
            const isExternal = /^(https?:|mailto:|#)/i.test(target);
            if (!isExternal && target) {
              const clean = target.split("#")[0] ?? "";
              const resolved = resolveRelative(currentPath, clean);
              const match =
                files.find((f) => f === resolved) ??
                files.find((f) => f === `${resolved}/README.md`);
              if (match) {
                return (
                  <a
                    href={`#${match}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(match);
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
          img: ({ src, alt, ...rest }) => {
            const s = typeof src === "string" ? src : "";
            const full = /^https?:/i.test(s) ? s : `${rawBase}/${resolveRelative(currentPath, s)}`;
            return <img src={full} alt={alt ?? ""} loading="lazy" {...rest} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
