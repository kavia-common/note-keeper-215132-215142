import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiArchive, FiCheck, FiEdit3, FiSearch } from "react-icons/fi";
import {
  fetchNotes,
  fetchNote,
  createNote,
  updateNote,
  deleteNote,
} from "./api/client";
import "./index.css";

function Header() {
  return (
    <div style={{ padding: 16, borderBottom: "1px solid rgba(17,24,39,0.08)" }}>
      <h1 style={{ margin: 0, color: "var(--primary)" }}>Note Keeper</h1>
      <div style={{ fontSize: 12, color: "#6b7280" }}>Ocean Professional</div>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <FiSearch
        size={18}
        style={{ position: "absolute", top: 11, left: 12, color: "#6b7280" }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search notes..."
        style={{ paddingLeft: 38 }}
      />
    </div>
  );
}

function ArchiveToggle({ archivedOnly, setArchivedOnly }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <button
        className="ghost"
        onClick={() => setArchivedOnly((v) => !v)}
        title="Toggle archived filter"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: archivedOnly ? "var(--primary)" : "#374151",
          background: archivedOnly ? "rgba(37,99,235,0.08)" : "transparent",
          padding: "6px 8px",
          borderRadius: 8,
        }}
      >
        <FiArchive />
        {archivedOnly ? "Showing archived" : "All notes"}
      </button>
    </div>
  );
}

function NotesList({ notes, selectedId, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {notes.map((n) => (
        <button
          key={n.id}
          className="card"
          onClick={() => onSelect(n.id)}
          style={{
            textAlign: "left",
            padding: 12,
            border:
              selectedId === n.id
                ? "2px solid var(--primary)"
                : "1px solid rgba(17,24,39,0.08)",
            background:
              selectedId === n.id ? "rgba(37,99,235,0.03)" : "var(--surface)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div className={`badge ${n.archived ? "archived" : ""}`}>
              {n.archived ? "Archived" : "Active"}
            </div>
          </div>
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
            {new Date(n.updated_at).toLocaleString()}
          </div>
        </button>
      ))}
      {notes.length === 0 && (
        <div style={{ color: "#6b7280", fontSize: 14, padding: 8 }}>No notes found</div>
      )}
    </div>
  );
}

function NoteDetails({ note }) {
  if (!note) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ color: "#6b7280" }}>Select a note to see details.</div>
      </div>
    );
  }
  return (
    <div className="card" style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{note.title}</h2>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{note.content}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <span className={`badge ${note.archived ? "archived" : ""}`}>
          {note.archived ? "Archived" : "Active"}
        </span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          Updated {new Date(note.updated_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function NoteEditor({ initial, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [archived, setArchived] = useState(initial?.archived || false);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          rows={10}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />
          Archive
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={onCancel}>Cancel</button>
        <button
          className="primary"
          onClick={() => onSave({ title, content, archived })}
          disabled={!title.trim() || !content.trim()}
        >
          <FiCheck /> Save
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [archivedOnly, setArchivedOnly] = useState(false);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => notes, [notes]);

  async function refreshList() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchNotes({
        q: search || undefined,
        archived: archivedOnly ? true : undefined,
      });
      setNotes(data);
      // If selected is deleted or filtered out, clear
      if (selectedId && !data.some((n) => n.id === selectedId)) {
        setSelectedId(null);
        setSelected(null);
        setEditing(false);
      }
    } catch (e) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  async function loadSelected(id) {
    setError("");
    try {
      const data = await fetchNote(id);
      setSelected(data);
      setSelectedId(id);
    } catch (e) {
      setError("Failed to load note");
    }
  }

  useEffect(() => {
    refreshList();
  }, [search, archivedOnly]);

  useEffect(() => {
    if (selectedId != null) {
      loadSelected(selectedId);
    }
  }, [selectedId]);

  async function handleCreate(payload) {
    setError("");
    try {
      const created = await createNote(payload);
      setCreating(false);
      setSelectedId(created.id);
      await refreshList();
    } catch (e) {
      setError("Failed to create note");
    }
  }

  async function handleUpdate(payload) {
    setError("");
    try {
      await updateNote(selectedId, payload);
      setEditing(false);
      await refreshList();
      if (selectedId) {
        await loadSelected(selectedId);
      }
    } catch (e) {
      setError("Failed to update note");
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    setError("");
    try {
      await deleteNote(selectedId);
      setSelectedId(null);
      setSelected(null);
      await refreshList();
    } catch (e) {
      setError("Failed to delete note");
    }
  }

  async function toggleArchive() {
    if (!selected) return;
    await handleUpdate({ archived: !selected.archived });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "100%" }}>
      <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="primary" onClick={() => { setCreating(true); setEditing(false); }}>
            <FiPlus /> New note
          </button>
          <SearchBar value={search} onChange={setSearch} />
          <ArchiveToggle archivedOnly={archivedOnly} setArchivedOnly={setArchivedOnly} />
          {loading ? (
            <div className="card" style={{ padding: 12 }}>Loading...</div>
          ) : (
            <NotesList notes={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </div>
      </aside>
      <main style={{ padding: 24, overflow: "auto" }}>
        {error && (
          <div
            className="card"
            style={{
              padding: 12,
              marginBottom: 12,
              borderLeft: "4px solid var(--error)",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {!creating && !editing && (
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button onClick={() => setEditing(true)} disabled={!selected}>
              <FiEdit3 /> Edit
            </button>
            <button onClick={toggleArchive} disabled={!selected}>
              <FiArchive /> {selected?.archived ? "Unarchive" : "Archive"}
            </button>
            <button onClick={handleDelete} disabled={!selected} style={{ color: "var(--error)", borderColor: "rgba(239,68,68,0.3)" }}>
              <FiTrash2 /> Delete
            </button>
          </div>
        )}

        {creating && (
          <NoteEditor
            onCancel={() => setCreating(false)}
            onSave={handleCreate}
          />
        )}

        {editing && selected && (
          <NoteEditor
            initial={selected}
            onCancel={() => setEditing(false)}
            onSave={handleUpdate}
          />
        )}

        {!creating && !editing && <NoteDetails note={selected} />}
      </main>
    </div>
  );
}
