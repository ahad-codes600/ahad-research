"use client";

import { useEffect, useState } from "react";

const categories = [
  ["precious-metals", "PRECIOUS METALS & COMMODITIES"],
  ["macro", "MACROECONOMIC ANALYSIS"],
  ["monetary-policy", "MONETARY POLICY"],
  ["positioning", "POSITIONING & COT"],
  ["geopolitics", "GEOPOLITICAL MARKET INTELLIGENCE"],
  ["economic-indicators", "ECONOMIC INDICATORS"],
  ["market-data", "MARKET DATA & CHARTS"],
];

const emptyForm = {
  id: "",
  title: "",
  category: "precious-metals",
  excerpt: "",
  content: "",
  pdfUrl: "",
  status: "published",
};

export default function AdminPanel() {
  const [logged, setLogged] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [pdfFile, setPdfFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  /* =========================================================
     LOGIN
  ========================================================= */

  async function login(e) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error || "Login failed.");
        return;
      }

      setLogged(true);
      setMessage("");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setMessage("Could not connect to the server.");
    } finally {
      setBusy(false);
    }
  }

  /* =========================================================
     LOAD ARTICLES
  ========================================================= */

  async function loadArticles() {
    try {
      const response = await fetch("/api/articles", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("LOAD ARTICLES ERROR:", data);
        return;
      }

      setArticles(
        Array.isArray(data.articles)
          ? data.articles
          : []
      );
    } catch (error) {
      console.error("LOAD ARTICLES ERROR:", error);
    }
  }

  useEffect(() => {
    if (logged) {
      loadArticles();
    }
  }, [logged]);

  /* =========================================================
     EDIT
  ========================================================= */

  function startEdit(article) {
    setEditing(true);

    setForm({
      id: article.id || "",
      title: article.title || "",
      category:
        article.category || "precious-metals",
      excerpt: article.excerpt || "",
      content: article.content || "",
      pdfUrl:
        article.pdfUrl ||
        article.pdf_url ||
        "",
      status:
        article.status || "published",
    });

    setPdfFile(null);
    setMessage("");

    const input =
      document.getElementById("article-pdf");

    if (input) {
      input.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     RESET
  ========================================================= */

  function resetForm() {
    setEditing(false);
    setForm(emptyForm);
    setPdfFile(null);
    setMessage("");

    const input =
      document.getElementById("article-pdf");

    if (input) {
      input.value = "";
    }
  }

  /* =========================================================
     PDF FILE SELECTION
  ========================================================= */

  function handlePdfChange(e) {
    const file =
      e.target.files &&
      e.target.files.length > 0
        ? e.target.files[0]
        : null;

    setMessage("");

    if (!file) {
      setPdfFile(null);
      return;
    }

    const fileName =
      String(file.name || "").toLowerCase();

    const isPdf =
      fileName.endsWith(".pdf") ||
      file.type === "application/pdf" ||
      file.type === "application/octet-stream" ||
      file.type === "";

    if (!isPdf) {
      setPdfFile(null);
      e.target.value = "";

      setMessage(
        "Please select a PDF file."
      );

      return;
    }

    if (
      file.size >
      25 * 1024 * 1024
    ) {
      setPdfFile(null);
      e.target.value = "";

      setMessage(
        "PDF must be smaller than 25 MB."
      );

      return;
    }

    setPdfFile(file);
  }

  /* =========================================================
     PDF UPLOAD
     
     IMPORTANT:
     We use FormData.
     We DO NOT manually set Content-Type.
     
     The browser creates:
     multipart/form-data; boundary=...
  ========================================================= */

 async function uploadPdf() {
  if (!pdfFile) {
    throw new Error("Please select a PDF file.");
  }

  const fileName =
    String(pdfFile.name || "").toLowerCase();

  const isPdf =
    fileName.endsWith(".pdf") ||
    pdfFile.type === "application/pdf" ||
    pdfFile.type === "application/octet-stream" ||
    pdfFile.type === "";

  if (!isPdf) {
    throw new Error("Please select a PDF file.");
  }

  if (
    pdfFile.size >
    25 * 1024 * 1024
  ) {
    throw new Error(
      "PDF must be smaller than 25 MB."
    );
  }

  if (pdfFile.size === 0) {
    throw new Error(
      "The selected PDF is empty."
    );
  }

  const response =
    await fetch(
      "/api/articles/upload",
      {
        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type":
            "application/pdf",

          "X-File-Name":
            encodeURIComponent(
              pdfFile.name
            )
        },

        body: pdfFile
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
        `PDF upload failed (${response.status}).`
    );
  }

  if (!data.url) {
    throw new Error(
      "PDF uploaded, but no PDF URL was returned."
    );
  }

  return data.url;
 }

  /* =========================================================
     SAVE / PUBLISH ARTICLE
  ========================================================= */

  async function saveArticle(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setMessage(
        "Please enter an article headline."
      );
      return;
    }

    if (!form.category) {
      setMessage(
        "Please select a category."
      );
      return;
    }

    /*
      New article:
      PDF is required.
    */

    if (!editing && !pdfFile) {
      setMessage(
        "Please select a PDF file before publishing."
      );
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      let pdfUrl =
        form.pdfUrl || "";

      /*
        Upload a new PDF if one was selected.
      */

      if (pdfFile) {
        setMessage(
          "Uploading PDF..."
        );

        pdfUrl =
          await uploadPdf();
      }

      /*
        Existing article must still have
        its previous PDF.
      */

      if (!pdfUrl) {
        throw new Error(
          "This article does not have a PDF."
        );
      }

      setMessage(
        "Saving research..."
      );

      const payload = {
        id: form.id,
        title: form.title.trim(),
        category: form.category,
        excerpt: form.excerpt.trim(),

        /*
          PDF is the article itself.
          We don't duplicate its contents
          into the HTML editor.
        */
        content: "",

        pdfUrl,
        status: form.status,
      };

      const response =
        await fetch(
          "/api/articles",
          {
            method:
              editing
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not save article."
        );
      }

      setMessage(
        editing
          ? "Article updated successfully."
          : "Article published successfully."
      );

      resetForm();

      await loadArticles();
    } catch (error) {
      console.error(
        "SAVE ARTICLE ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Could not save article."
      );
    } finally {
      setBusy(false);
    }
  }

  /* =========================================================
     DELETE ARTICLE
  ========================================================= */

  async function deleteArticle(
    id,
    title
  ) {
    const confirmed =
      window.confirm(
        `Delete "${title}"?\n\nThis cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response =
        await fetch(
          `/api/articles?id=${encodeURIComponent(
            id
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not delete article."
        );
      }

      setMessage(
        "Article deleted successfully."
      );

      if (form.id === id) {
        resetForm();
      }

      await loadArticles();
    } catch (error) {
      console.error(
        "DELETE ARTICLE ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Could not delete article."
      );
    } finally {
      setBusy(false);
    }
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  async function logout() {
    try {
      await fetch(
        "/api/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      setLogged(false);
      setArticles([]);
      resetForm();
    }
  }

  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (!logged) {
    return (
      <main className="admin-shell">
        <div className="login-card">
          <p className="eyebrow">
            PRIVATE ADMINISTRATION
          </p>

          <h1>
            Research Administration
          </h1>

          <p>
            Authorized access only.
          </p>

          <form onSubmit={login}>
            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
                autoComplete="email"
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
            >
              {busy
                ? "AUTHENTICATING..."
                : "AUTHENTICATE"}
            </button>
          </form>

          {message && (
            <div className="form-message">
              {message}
            </div>
          )}
        </div>
      </main>
    );
  }

  /* =========================================================
     ADMIN PANEL
  ========================================================= */

  return (
    <main className="admin-shell">

      <style jsx global>{`
        .admin-grid {
          max-width: 1250px;
          margin: auto;
          display: grid;
          grid-template-columns:
            minmax(0, 1.15fr)
            minmax(360px, 0.85fr);
          gap: 24px;
          align-items: start;
        }

        .editor-card,
        .article-manager {
          background: #fff;
          border: 1px solid #d9dde3;
          padding: 30px;
          box-shadow: 0 10px 35px #0000000d;
        }

        .editor-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #d9dde3;
          padding-bottom: 18px;
          margin-bottom: 22px;
        }

        .editor-title h2 {
          font-family: Georgia, serif;
          font-size: 29px;
          margin: 0;
        }

        .article-count {
          display: grid;
          place-items: center;
          min-width: 34px;
          height: 34px;
          border: 1px solid #cbd1d8;
          font-size: 12px;
          font-weight: 900;
        }

        .manager-list {
          display: grid;
          gap: 2px;
          background: #d9dde3;
        }

        .manager-item {
          background: #fff;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .manager-info {
          min-width: 0;
        }

        .manager-info h3 {
          font-family: Georgia, serif;
          font-size: 19px;
          line-height: 1.2;
          margin: 8px 0;
        }

        .manager-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          color: #7a8491;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: .06em;
        }

        .status {
          padding: 3px 7px;
          background: #e8edf1;
          color: #4e5966;
        }

        .status.draft {
          background: #f0ece4;
          color: #765d35;
        }

        .manager-actions {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-shrink: 0;
        }

        .small-btn {
          border: 1px solid #bfc6cf;
          background: #fff;
          color: #18212b;
          padding: 8px 10px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
          cursor: pointer;
          text-decoration: none;
        }

        .small-btn:hover {
          background: #eef1f4;
        }

        .small-btn.danger {
          color: #9b2929;
          border-color: #d6b4b4;
        }

        .small-btn:disabled,
        .login-card button:disabled,
        .editor button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .manager-empty {
          padding: 30px;
          background: #f5f7f9;
          color: #697383;
          font-size: 13px;
        }

        .pdf-upload-box {
          border: 1px dashed #b9c0c9;
          background: #f7f8fa;
          padding: 22px;
          margin-top: 8px;
        }

        .pdf-upload-box input {
          display: block;
          width: 100%;
          margin-top: 10px;
        }

        .pdf-selected {
          margin-top: 12px;
          font-size: 12px;
          color: #4e5966;
          line-height: 1.5;
        }

        .pdf-existing {
          margin-top: 10px;
          font-size: 12px;
          color: #4e5966;
        }

        .pdf-existing a {
          font-weight: 800;
          text-decoration: underline;
        }

        .pdf-note {
          margin-top: 8px;
          font-size: 11px;
          color: #7a8491;
          line-height: 1.5;
        }

        @media(max-width:1000px) {
          .admin-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:600px) {
          .admin-shell {
            padding: 35px 14px;
          }

          .editor-card,
          .article-manager {
            padding: 20px;
          }

          .manager-item {
            flex-direction: column;
          }

          .manager-actions {
            align-self: flex-start;
          }
        }
      `}</style>

      <div className="admin-head">
        <div>
          <p className="eyebrow">
            ADMINISTRATION
          </p>

          <h1>
            Research CMS
          </h1>
        </div>

        <button
          onClick={logout}
          className="ghost"
          disabled={busy}
        >
          LOG OUT
        </button>
      </div>

      <div className="admin-grid">

        {/* =====================================================
            EDITOR
        ===================================================== */}

        <section className="editor-card">

          <div className="editor-title">
            <div>
              <p className="eyebrow">
                {editing
                  ? "EDIT RESEARCH"
                  : "NEW RESEARCH"}
              </p>

              <h2>
                {editing
                  ? "Update Article"
                  : "Publish Research"}
              </h2>
            </div>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="ghost"
                disabled={busy}
              >
                CANCEL EDIT
              </button>
            )}
          </div>

          <form
            className="editor"
            onSubmit={saveArticle}
          >

            <label>
              Headline

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title:
                      e.target.value,
                  })
                }
                placeholder="Enter research headline"
                required
              />
            </label>

            <label>
              Research category

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target.value,
                  })
                }
              >
                {categories.map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Publication status

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target.value,
                  })
                }
              >
                <option value="published">
                  PUBLISHED
                </option>

                <option value="draft">
                  DRAFT
                </option>
              </select>
            </label>

            <label>
              Article summary

              <textarea
                rows="3"
                value={form.excerpt}
                onChange={(e) =>
                  setForm({
                    ...form,
                    excerpt:
                      e.target.value,
                  })
                }
                placeholder="Short description for cards and search previews"
              />
            </label>

            {/* =================================================
                PDF
            ================================================= */}

            <label>
              Article PDF

              <div className="pdf-upload-box">

                <strong>
                  {editing
                    ? "Replace PDF (optional)"
                    : "Select PDF"}
                </strong>

                <input
                  id="article-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={
                    handlePdfChange
                  }
                  disabled={busy}
                />

                {pdfFile && (
                  <div className="pdf-selected">
                    <strong>
                      Selected:
                    </strong>{" "}
                    {pdfFile.name}

                    <br />

                    Type:{" "}
                    {pdfFile.type ||
                      "PDF"}

                    <br />

                    Size:{" "}
                    {(
                      pdfFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </div>
                )}

                {editing &&
                  form.pdfUrl &&
                  !pdfFile && (
                    <div className="pdf-existing">
                      Existing PDF:{" "}

                      <a
                        href={
                          form.pdfUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        OPEN CURRENT PDF
                      </a>
                    </div>
                  )}

                <div className="pdf-note">
                  PDF only. Maximum file
                  size: 25 MB.
                </div>

              </div>
            </label>

            <button
              type="submit"
              disabled={busy}
            >
              {busy
                ? "PROCESSING..."
                : editing
                ? "SAVE CHANGES"
                : "PUBLISH RESEARCH"}
            </button>

            {message && (
              <div className="form-message">
                {message}
              </div>
            )}

          </form>
        </section>

        {/* =====================================================
            ARTICLE MANAGER
        ===================================================== */}

        <section className="article-manager">

          <div className="editor-title">

            <div>
              <p className="eyebrow">
                CONTENT MANAGEMENT
              </p>

              <h2>
                Your Articles
              </h2>
            </div>

            <span className="article-count">
              {articles.length}
            </span>

          </div>

          {articles.length === 0 ? (

            <div className="manager-empty">
              No articles yet.
            </div>

          ) : (

            <div className="manager-list">

              {articles.map(
                (article) => {

                  const pdfUrl =
                    article.pdfUrl ||
                    article.pdf_url ||
                    "";

                  return (
                    <div
                      className="manager-item"
                      key={article.id}
                    >

                      <div className="manager-info">

                        <span className="tag">
                          {
                            article.categoryLabel
                          }
                        </span>

                        <h3>
                          {article.title}
                        </h3>

                        <div className="manager-meta">

                          <span
                            className={`status ${article.status}`}
                          >
                            {
                              article.status
                            }
                          </span>

                          <span>
                            {
                              article.date
                            }
                          </span>

                        </div>

                      </div>

                      <div className="manager-actions">

                        {pdfUrl && (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="small-btn"
                          >
                            PDF
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              article
                            )
                          }
                          className="small-btn"
                          disabled={busy}
                        >
                          EDIT
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteArticle(
                              article.id,
                              article.title
                            )
                          }
                          className="small-btn danger"
                          disabled={busy}
                        >
                          DELETE
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}