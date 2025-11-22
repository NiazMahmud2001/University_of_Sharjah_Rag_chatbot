export function renderMarkdownSimple(input: string): string {
  const lines = input.replace(/\r\n?/g, "\n").split(/\n/);

  let html = "";
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeBuffer: string[] = [];

  const flushList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (/^```/.test(line)) {
      if (inCode) {
        const code = codeBuffer.join("\n");
        html += `<pre><code>${escapeHtml(code)}</code></pre>`;
        codeBuffer = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(raw);
      continue;
    }

    if (!line.trim()) {
      flushList();
      html += "";
      continue;
    }

    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length;
      const content = inline(hMatch[2]);
      html += `<h${level}>${content}</h${level}>`;
      continue;
    }

    const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inOl) { flushList(); html += "<ol>"; inOl = true; }
      html += `<li>${inline(olMatch[1])}</li>`;
      continue;
    }

    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (!inUl) { flushList(); html += "<ul>"; inUl = true; }
      html += `<li>${inline(ulMatch[1])}</li>`;
      continue;
    }

    flushList();
    html += `<p>${inline(line)}</p>`;
  }

  flushList();
  if (inCode && codeBuffer.length) {
    const code = codeBuffer.join("\n");
    html += `<pre><code>${escapeHtml(code)}</code></pre>`;
  }

  return html;
}

function inline(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(?!\s)([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
  return s;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}