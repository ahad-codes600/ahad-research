"use client";

import { useEffect, useState } from "react";

export default function RichEditor({ value, onChange, onFileChange }) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (value?.pdfFileName) {
      setFileName(value.pdfFileName);
    }
  }, [value]);

  function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("PDF must be smaller than 50 MB.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);

    if (onFileChange) {
      onFileChange(file);
    }
  }

  return (
    <div className="rich-editor">
      <div
        style={{
          border: "1px solid #d9dde3",
          padding: "30px",
          background: "#f8f9fa",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "12px" }}>📄</div>

        <h3
          style={{
            margin: "0 0 8px",
            fontFamily: "Georgia, serif",
            fontSize: "22px",
          }}
        >
          Upload Research PDF
        </h3>

        <p
          style={{
            margin: "0 auto 20px",
            maxWidth: "520px",
            color: "#697383",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          Upload the finished PDF exactly as you created it. The PDF will be
          stored and displayed as a PDF without converting its formatting,
          images, charts, fonts, or layout into HTML.
        </p>

        <label
          style={{
            display: "inline-block",
            padding: "12px 18px",
            border: "1px solid #18212b",
            background: "#18212b",
            color: "#fff",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: ".08em",
          }}
        >
          CHOOSE PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </label>

        {fileName && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#fff",
              border: "1px solid #d9dde3",
              fontSize: "13px",
              fontWeight: 700,
              wordBreak: "break-word",
            }}
          >
            ✓ {fileName}
          </div>
        )}
      </div>

      <div className="editor-help">
        Upload your completed PDF. Its original design, images, graphs, tables,
        fonts, colors, and page layout will remain inside the PDF.
      </div>
    </div>
  );
}