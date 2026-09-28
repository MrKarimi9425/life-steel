import Image from "next/image";
import type { ReactNode } from "react";
import { mediaUrl } from "@/lib/api";
import type { BlogMedia, BlogNode } from "@/lib/blog";

function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function span(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 100
    ? value
    : 1;
}
function markedText(node: BlogNode): ReactNode {
  return (node.marks ?? []).reduce<ReactNode>((value, mark, index) => {
    switch (mark.type) {
      case "bold":
        return <strong key={index}>{value}</strong>;
      case "italic":
        return <em key={index}>{value}</em>;
      case "underline":
        return <u key={index}>{value}</u>;
      case "strike":
        return <s key={index}>{value}</s>;
      case "code":
        return <code key={index}>{value}</code>;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        return href ? (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : (
          value
        );
      }
      default:
        return value;
    }
  }, node.text ?? "");
}

export function BlockContent({ content, media }: { content: BlogNode; media: BlogMedia[] }) {
  let count = 0;
  function render(node: BlogNode, key: string, depth = 0): ReactNode {
    if (++count > 10000 || depth > 32) return null;
    if (node.type === "text") return <span key={key}>{markedText(node)}</span>;
    const children = (node.content ?? []).map((child, index) =>
      render(child, `${key}-${index}`, depth + 1),
    );
    switch (node.type) {
      case "doc":
        return <div key={key}>{children}</div>;
      case "paragraph":
        return <p key={key}>{children}</p>;
      case "heading": {
        if (node.attrs?.level === 2) return <h2 key={key}>{children}</h2>;
        if (node.attrs?.level === 3) return <h3 key={key}>{children}</h3>;
        return <h4 key={key}>{children}</h4>;
      }
      case "bulletList":
        return <ul key={key}>{children}</ul>;
      case "orderedList":
        return (
          <ol key={key} start={typeof node.attrs?.start === "number" ? node.attrs.start : 1}>
            {children}
          </ol>
        );
      case "listItem":
        return <li key={key}>{children}</li>;
      case "blockquote":
        return <blockquote key={key}>{children}</blockquote>;
      case "horizontalRule":
        return <hr key={key} />;
      case "hardBreak":
        return <br key={key} />;
      case "image": {
        // Resolve the source from the owning gallery, never from document URLs.
        const image = media.find((item) => item.id === node.attrs?.mediaId);
        const src = mediaUrl(image?.path ?? null);
        if (!image || !src) return null;
        const translation = image.translations[0];
        return (
          <figure key={key}>
            <Image
              src={src}
              alt={
                typeof node.attrs?.alt === "string" ? node.attrs.alt : (translation?.altText ?? "")
              }
              width={image.width ?? 1200}
              height={image.height ?? 1200}
              sizes="(max-width: 900px) 100vw, 850px"
            />
            {translation?.caption && <figcaption>{translation.caption}</figcaption>}
          </figure>
        );
      }
      case "table":
        return (
          <div key={key} className="article-table-scroll" tabIndex={0}>
            <table>
              <tbody>{children}</tbody>
            </table>
          </div>
        );
      case "tableRow":
        return <tr key={key}>{children}</tr>;
      case "tableHeader":
        return (
          <th key={key} colSpan={span(node.attrs?.colspan)} rowSpan={span(node.attrs?.rowspan)}>
            {children}
          </th>
        );
      case "tableCell":
        return (
          <td key={key} colSpan={span(node.attrs?.colspan)} rowSpan={span(node.attrs?.rowspan)}>
            {children}
          </td>
        );
      default:
        return null;
    }
  }
  return <div className="article-content">{render(content, "article")}</div>;
}

export const BlogContent = BlockContent;
