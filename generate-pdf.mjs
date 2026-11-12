import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const researchMd = readFileSync('research-report-draft.md', 'utf8');
const submissionMd = readFileSync('SUBMISSION.md', 'utf8');

// Lightweight, robust markdown-to-HTML formatter for clean document conversion
function mdToHtml(md) {
  let lines = md.split('\n');
  let html = [];
  let inTable = false;
  let tableHeader = true;
  let inList = false;
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html.push('</code></pre>');
        inCode = false;
      } else {
        if (inList) { html.push('</ul>'); inList = false; }
        if (inTable) { html.push('</tbody></table>'); inTable = false; }
        html.push('<pre><code>');
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      html.push(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    // Blank lines
    if (!line.trim()) {
      if (inList) { html.push('</ul>'); inList = false; }
      if (inTable) { html.push('</tbody></table>'); inTable = false; }
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      let cells = line.split('|').slice(1, -1).map(c => c.trim());
      // Check if divider row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        tableHeader = false;
        continue;
      }
      if (!inTable) {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push('<div class="table-container"><table>');
        html.push('<thead><tr>' + cells.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
        inTable = true;
        tableHeader = true;
      } else {
        html.push('<tr>' + cells.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>');
      }
      continue;
    } else if (inTable) {
      html.push('</tbody></table></div>');
      inTable = false;
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h4>${inline(line.slice(5))}</h4>`);
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Horizontal rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push('<hr />');
      continue;
    }

    // Unordered lists
    if (/^(\*|-)\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(line.replace(/^(\*|-)\s+/, ''))}</li>`);
      continue;
    } else if (inList) {
      html.push('</ul>');
      inList = false;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(line)) {
      html.push(`<div class="numbered-item">${inline(line)}</div>`);
      continue;
    }

    // Paragraphs
    html.push(`<p>${inline(line)}</p>`);
  }

  if (inList) html.push('</ul>');
  if (inTable) html.push('</tbody></table></div>');
  if (inCode) html.push('</code></pre>');

  return html.join('\n');
}

function inline(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mosaic Fellowship Builder Challenge — Submission</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .header-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .header-banner h1 {
      margin: 0 0 6px 0;
      font-size: 20pt;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .header-banner .subtitle {
      font-size: 11pt;
      color: #93c5fd;
      margin: 0 0 14px 0;
    }
    .header-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      font-size: 9pt;
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 12px;
    }
    .header-meta div strong {
      color: #bfdbfe;
    }
    h1 {
      font-size: 16pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10pt;
      font-weight: 600;
      color: #475569;
      margin-top: 10px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 8px 0;
    }
    blockquote {
      margin: 10px 0;
      padding: 8px 14px;
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      color: #334155;
      font-style: italic;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
    }
    .table-container {
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #0f172a;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: "Cascadia Code", Consolas, "Courier New", monospace;
      font-size: 8pt;
      line-height: 1.4;
      overflow-x: auto;
      margin: 10px 0;
      page-break-inside: avoid;
    }
    code {
      font-family: "Cascadia Code", Consolas, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #be123c;
      padding: 1px 4px;
      border-radius: 3px;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    ul {
      margin: 4px 0 10px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    .numbered-item {
      margin: 6px 0;
      padding-left: 6px;
    }
    hr {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 20px 0;
    }
    .page-break {
      page-break-before: always;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #dcfce7; color: #166534; }
    .footer-note {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>

  <div class="header-banner">
    <h1>MOSAIC FELLOWSHIP BUILDER CHALLENGE</h1>
    <div class="subtitle">Comprehensive Submission: Primary Customer Discovery & Full-Stack Application</div>
    <div class="header-meta">
      <div><strong>Candidate:</strong> Surya K. Tiwari</div>
      <div><strong>Brand Selected:</strong> Little Joys (Mosaic Wellness)</div>
      <div><strong>Application Concept:</strong> Little Joys Flavour Finder</div>
      <div><strong>GitHub Repository:</strong> https://github.com/SuryaKTiwari11/mosiac-fellowship</div>
      <div><strong>Evaluation Date:</strong> November 2024</div>
      <div><strong>Status:</strong> Completed & Verified (5 Primary Interviews + Full-Stack App)</div>
    </div>
  </div>

  ${mdToHtml(researchMd)}

  <div class="page-break"></div>

  <div class="header-banner" style="background: linear-gradient(135deg, #1e3a8a 0%, #047857 100%);">
    <h1>PART 2: APPLICATION & SYSTEMS THINKING</h1>
    <div class="subtitle">Little Joys Flavour Finder — Technical Solution & Architecture</div>
  </div>

  ${mdToHtml(submissionMd)}

  <div class="footer-note">
    Mosaic Wellness Fellowship Builder Challenge — Submitted by Surya K. Tiwari — November 2024
  </div>

</body>
</html>`;

writeFileSync('submission.html', htmlContent, 'utf8');
console.log('Generated submission.html successfully');
