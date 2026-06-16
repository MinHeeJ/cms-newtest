import { validationError } from "../../api/middleware/error-handler.js";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
}

export interface MarkdownPreviewResult {
  html: string;
  warnings: string[];
}

export class PreviewService {
  render(markdownBody: string, title?: string, summary?: string): MarkdownPreviewResult {
    if (!markdownBody.trim()) {
      throw validationError("미리보기할 마크다운 본문이 필요합니다.");
    }

    const warnings: string[] = [];
    const lines = markdownBody.split(/\r?\n/);
    const html: string[] = [];
    let inCodeBlock = false;
    let tableBuffer: string[] = [];

    const flushTable = () => {
      if (tableBuffer.length < 2) {
        tableBuffer = [];
        return;
      }

      const [header, separator, ...rows] = tableBuffer;
      if (!separator.includes("---")) {
        warnings.push("표 구분 행을 확인해 주세요.");
        html.push(...tableBuffer.map((line) => `<p>${renderInlineMarkdown(line)}</p>`));
      } else {
        const headerCells = header.split("|").filter(Boolean).map((cell) => `<th>${renderInlineMarkdown(cell.trim())}</th>`).join("");
        const bodyRows = rows
          .map((row) => `<tr>${row.split("|").filter(Boolean).map((cell) => `<td>${renderInlineMarkdown(cell.trim())}</td>`).join("")}</tr>`)
          .join("");
        html.push(`<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`);
      }
      tableBuffer = [];
    };

    for (const line of lines) {
      if (line.startsWith("```")) {
        flushTable();
        inCodeBlock = !inCodeBlock;
        html.push(inCodeBlock ? "<pre><code>" : "</code></pre>");
        continue;
      }

      if (inCodeBlock) {
        html.push(escapeHtml(line));
        continue;
      }

      if (line.includes("|") && !line.startsWith("#")) {
        tableBuffer.push(line);
        continue;
      }

      flushTable();

      if (line.startsWith("# ")) {
        html.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
      } else if (line.startsWith("## ")) {
        html.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
      } else if (line.startsWith("- ")) {
        html.push(`<ul><li>${renderInlineMarkdown(line.slice(2))}</li></ul>`);
      } else if (line.trim()) {
        html.push(`<p>${renderInlineMarkdown(line)}</p>`);
      }
    }

    flushTable();
    if (inCodeBlock) {
      warnings.push("닫히지 않은 코드 블록이 있습니다.");
      html.push("</code></pre>");
    }

    if (/!\[\]\(/.test(markdownBody)) {
      warnings.push("이미지 대체 텍스트가 비어 있습니다.");
    }

    const article = [
      "<article class=\"cms-preview\">",
      title ? `<h1>${escapeHtml(title)}</h1>` : "",
      summary ? `<p class=\"summary\">${escapeHtml(summary)}</p>` : "",
      ...html,
      "</article>"
    ].join("");

    return { html: article, warnings };
  }
}

export const previewService = new PreviewService();
