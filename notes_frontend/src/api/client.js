import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3001";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// PUBLIC_INTERFACE
export async function fetchNotes({ q, archived } = {}) {
  /** Fetch list of notes with optional search and archived filter. */
  const params = {};
  if (q) params.q = q;
  if (archived !== undefined) params.archived = archived;
  const res = await api.get("/notes", { params });
  return res.data;
}

// PUBLIC_INTERFACE
export async function fetchNote(id) {
  /** Fetch a single note by id. */
  const res = await api.get(`/notes/${id}`);
  return res.data;
}

// PUBLIC_INTERFACE
export async function createNote(data) {
  /** Create a new note. */
  const res = await api.post("/notes", data);
  return res.data;
}

// PUBLIC_INTERFACE
export async function updateNote(id, data) {
  /** Update a note by id. */
  const res = await api.put(`/notes/${id}`, data);
  return res.data;
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. */
  await api.delete(`/notes/${id}`);
}
