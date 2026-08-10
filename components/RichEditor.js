'use client';

import { useEffect, useRef, useState } from "react";

const tools = [
  ["bold", "B", "Bold"],
  ["italic", "I", "Italic"],
  ["underline", "U", "Underline"],
  ["formatBlock", "H2", "Heading"],
  ["insertUnorderedList", "• List", "Bulleted list"],
  ["insertOrderedList", "1. List", "Numbered list"],
  ["blockquote", "❝", "Quote"],
];

function normalizeInitial(value) {
  if (!value) return "";
  if (/<[a-z][\\s\\S]*>/i.test(value)) return value;
  return value
    .split(/\\n\\n+/)
    .map(p => `<p>${p.replace(/\\n/g, "<br />")}</p>`)
    .join("");
}

export default function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && ref.current) {
      ref.current.innerHTML = normalizeInitial(value);
      initialized.current = true;
    }
  }, [value]);

  function emit() {
    onChange(ref.current?.innerHTML || "");
  }

  function command(cmd, arg = null) {
    ref.current?.focus();
    if (cmd === "formatBlock") document.execCommand(cmd, false, "<h2>");
    else if (cmd === "blockquote") document.execCommand(cmd, false, null);
    else document.execCommand(cmd, false, arg);
    emit();
  }

  function addLink() {
    const url = window.prompt("Enter the URL:");
    if (!url) return;
    command("createLink", url);
  }

  function addImage() {
    const url = window.prompt("Enter an image/chart URL:");
    if (!url) return;
    command("insertImage", url);
  }

  function addTable() {
    const rows = Number(window.prompt("Number of rows:", "3"));
    const cols = Number(window.prompt("Number of columns:", "3"));
    if (!rows || !cols || rows > 12 || cols > 8) return;
    let html = '<table><tbody>';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) html += r === 0 ? "<th>Header</th>" : "<td>Cell</td>";
      html += "</tr>";
    }
    html += "</tbody></table><p><br /></p>";
    ref.current?.focus();
    document.execCommand("insertHTML", false, html);
    emit();
  }

  return (
    <div className="rich-editor">
      <div className="editor-toolbar" aria-label="Article formatting tools">
        {tools.map(([cmd, label, title]) => (
          <button type="button" key={cmd} title={title} onMouseDown={e=>e.preventDefault()} onClick={()=>command(cmd)}>{label}</button>
        ))}
        <span className="toolbar-divider" />
        <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addLink}>LINK</button>
        <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addImage}>IMAGE / CHART</button>
        <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addTable}>TABLE</button>
        <button type="button" className={preview ? "active" : ""} onClick={()=>setPreview(!preview)}>{preview ? "EDIT" : "PREVIEW"}</button>
      </div>

      {preview ? (
        <div className="rich-preview article-body" dangerouslySetInnerHTML={{__html: ref.current?.innerHTML || ""}} />
      ) : (
        <div
          ref={ref}
          className="rich-input"
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          data-placeholder="Write your market analysis here..."
        />
      )}
      <div className="editor-help">Formatting is stored with the article. Use IMAGE / CHART for hosted images or chart screenshots.</div>
    </div>
  );
}
