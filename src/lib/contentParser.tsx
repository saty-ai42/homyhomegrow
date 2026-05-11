import React from "react";

/**
 * Parses markdown-like content into React elements.
 * Supports:
 * - Headers (# ## ###)
 * - Bold (**text**)
 * - Images (![alt](url)) → <figure> with caption
 * - Unordered lists (- item or * item)
 * - Paragraphs
 */
export function parseContent(content: string | null | undefined): React.ReactNode[] {
  if (!content) return [];

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let blockKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line → skip (will be handled by spacing)
    if (!trimmed) continue;

    // Parse ### headers
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={blockKey++} className="text-xl font-bold mt-6 mb-3 text-foreground font-heading">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    // Parse ## headers
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={blockKey++} className="text-2xl font-bold mt-8 mb-4 text-foreground font-heading">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    // Parse # headers
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 key={blockKey++} className="text-3xl font-bold mt-8 mb-4 text-foreground font-heading">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // Parse ![alt](url) as standalone image (URL validated)
    if (trimmed.startsWith("![") && trimmed.includes("](")) {
      const match = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (match) {
        const alt = match[1];
        const rawUrl = match[2];
        // Only allow relative URLs, http://, https:// — block javascript: data: etc.
        const isSafeUrl = /^\//.test(rawUrl) || /^https?:\/\//.test(rawUrl);
        if (!isSafeUrl) {
          blocks.push(<p key={blockKey++} className="text-muted-foreground italic">{alt || "[Ungültiges Bild]"}</p>);
          continue;
        }
        blocks.push(
          <figure key={blockKey++} className="my-6">
            <img
              src={rawUrl}
              alt={alt}
              className="w-full rounded-lg border border-border"
              loading="lazy"
            />
            {alt && (
              <figcaption className="mt-2 text-sm text-center text-muted-foreground">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        continue;
      }
    }

    // Parse unordered lists (- item or * item)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const listItems: string[] = [];
      let j = i;
      while (j < lines.length) {
        const listLine = lines[j].trim();
        if (listLine.startsWith("- ") || listLine.startsWith("* ")) {
          listItems.push(listLine.slice(2));
          j++;
        } else if (listLine === "") {
          j++;
        } else {
          break;
        }
      }
      i = j - 1;
      blocks.push(
        <ul key={blockKey++} className="my-3 ml-5 space-y-1 list-disc text-muted-foreground">
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Parse ordered lists (1. item, 2. item)
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      let j = i;
      while (j < lines.length) {
        const listLine = lines[j].trim();
        if (/^\d+\.\s/.test(listLine)) {
          listItems.push(listLine.replace(/^\d+\.\s/, ""));
          j++;
        } else if (listLine === "") {
          j++;
        } else {
          break;
        }
      }
      i = j - 1;
      blocks.push(
        <ol key={blockKey++} className="my-3 ml-5 space-y-1 list-decimal text-muted-foreground">
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Default: paragraph with inline formatting
    blocks.push(
      <p key={blockKey++} className="mb-3 leading-relaxed text-muted-foreground">
        {parseInline(trimmed)}
      </p>
    );
  }

  return blocks;
}

/**
 * Parse inline formatting: **bold** and regular text
 */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    parts.push(text);
  }

  return parts;
}
