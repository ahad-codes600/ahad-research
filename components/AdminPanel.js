'use client';

import { useEffect, useState } from "react";
import RichEditor from "./RichEditor";

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
  status: "published"
};

export default function AdminPanel() {
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function login(e) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    setBusy(false);
    if (r.ok) {
      setLogged(true);
      setMessage("");
      loadArticles();
    } else {
      setMessage(d.error || "Login failed.");
    }
  }

  async function loadArticles() {
    const r = await fetch("/api/articles", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setArticles(d.articles || []);
    }
  }

  useEffect(() => {
    if (logged) loadArticles();
  }, [logged]);

  function startEdit(article) {
    setEditing(true);
    setForm({
      id: article.id,
      title: article.title,
      category: article.category,
      excerpt: article.excerpt || "",
      content: article.content,
      status: article.status
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(false);
    setForm(emptyForm);
    setMessage("");
  }

  async function saveArticle(e) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/articles", {
      method: editing ? "PUT" : "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    const d = await r.json();
    setBusy(false);

    if (r.ok) {
      setMessage(editing ? "Article updated successfully." : "Article published successfully.");
      resetForm();
      await loadArticles();
    } else {
      setMessage(d.error || "Could not save article.");
    }
  }

  async function deleteArticle(id, title) {
    if (!window.confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return;

    setBusy(true);
    const r = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    const d = await r.json();
    setBusy(false);

    if (r.ok) {
      setMessage("Article deleted.");
      if (form.id === id) resetForm();
      await loadArticles();
    } else {
      setMessage(d.error || "Could not delete article.");
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setLogged(false);
    setArticles([]);
    resetForm();
  }

  if (!logged) return (
    <main className="admin-shell">
      <div className="login-card">
        <p className="eyebrow">PRIVATE ADMINISTRATION</p>
        <h1>Research Administration</h1>
        <p>Authorized access only.</p>
        <form onSubmit={login}>
          <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
          <button type="submit" disabled={busy}>{busy ? "AUTHENTICATING..." : "AUTHENTICATE"}</button>
        </form>
        {message && <div className="form-message">{message}</div>}
      </div>
    </main>
  );

  return (
    <main className="admin-shell">
      <style jsx global>{`
        .admin-grid{max-width:1250px;margin:auto;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(360px,.85fr);gap:24px;align-items:start}
        .editor-card,.article-manager{background:#fff;border:1px solid #d9dde3;padding:30px;box-shadow:0 10px 35px #0000000d}
        .editor-title{display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid #d9dde3;padding-bottom:18px;margin-bottom:22px}
        .editor-title h2{font-family:Georgia,serif;font-size:29px;margin:0}
        .article-count{display:grid;place-items:center;min-width:34px;height:34px;border:1px solid #cbd1d8;font-size:12px;font-weight:900}
        .manager-list{display:grid;gap:2px;background:#d9dde3}
        .manager-item{background:#fff;padding:20px;display:flex;justify-content:space-between;gap:15px}
        .manager-info{min-width:0}.manager-info h3{font-family:Georgia,serif;font-size:19px;line-height:1.2;margin:8px 0}
        .manager-meta{display:flex;gap:12px;align-items:center;color:#7a8491;font-size:10px;text-transform:uppercase;font-weight:800;letter-spacing:.06em}
        .status{padding:3px 7px;background:#e8edf1;color:#4e5966}.status.draft{background:#f0ece4;color:#765d35}
        .manager-actions{display:flex;gap:6px;align-items:center;flex-shrink:0}
        .small-btn{border:1px solid #bfc6cf;background:#fff;color:#18212b;padding:8px 10px;font-size:9px;font-weight:900;letter-spacing:.08em;cursor:pointer}
        .small-btn:hover{background:#eef1f4}.small-btn.danger{color:#9b2929;border-color:#d6b4b4}
        .small-btn:disabled,.login-card button:disabled,.editor button:disabled{opacity:.55;cursor:not-allowed}
        .manager-empty{padding:30px;background:#f5f7f9;color:#697383;font-size:13px}
        @media(max-width:1000px){.admin-grid{grid-template-columns:1fr}}
        @media(max-width:600px){.admin-shell{padding:35px 14px}.editor-card,.article-manager{padding:20px}.manager-item{flex-direction:column}.manager-actions{align-self:flex-start}}
      `}</style>

      <div className="admin-head">
        <div><p className="eyebrow">ADMINISTRATION</p><h1>Research CMS</h1></div>
        <button onClick={logout} className="ghost">LOG OUT</button>
      </div>

      <div className="admin-grid">
        <section className="editor-card">
          <div className="editor-title">
            <div><p className="eyebrow">{editing ? "EDIT RESEARCH" : "NEW RESEARCH"}</p><h2>{editing ? "Update Article" : "Publish Research"}</h2></div>
            {editing && <button type="button" onClick={resetForm} className="ghost">CANCEL EDIT</button>}
          </div>

          <form className="editor" onSubmit={saveArticle}>
            <label>Headline<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Enter research headline" required /></label>
            <label>Research category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
            <label>Publication status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="published">PUBLISHED</option><option value="draft">DRAFT</option></select></label>
            <label>Article summary<textarea rows="3" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="Short description for cards and search previews" /></label>
            <label>Article body<RichEditor value={form.content} onChange={content=>setForm({...form,content})} /></label>
            <button type="submit" disabled={busy}>{busy ? "SAVING..." : editing ? "SAVE CHANGES" : "PUBLISH RESEARCH"}</button>
            {message && <div className="form-message">{message}</div>}
          </form>
        </section>

        <section className="article-manager">
          <div className="editor-title">
            <div><p className="eyebrow">CONTENT MANAGEMENT</p><h2>Your Articles</h2></div>
            <span className="article-count">{articles.length}</span>
          </div>

          {articles.length === 0 ? <div className="manager-empty">No articles yet.</div> :
            <div className="manager-list">
              {articles.map(article => (
                <div className="manager-item" key={article.id}>
                  <div className="manager-info">
                    <span className="tag">{article.categoryLabel}</span>
                    <h3>{article.title}</h3>
                    <div className="manager-meta"><span className={`status ${article.status}`}>{article.status}</span><span>{article.date}</span></div>
                  </div>
                  <div className="manager-actions">
                    <button onClick={() => startEdit(article)} className="small-btn">EDIT</button>
                    <button onClick={() => deleteArticle(article.id, article.title)} className="small-btn danger" disabled={busy}>DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          }
        </section>
      </div>
    </main>
  );
}
