import { Folder } from "@/types";

const KEY = "tg.folders.v1";

export function loadFolders(): Folder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFolders(folders: Folder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(folders));
}

export function upsertFolder(folder: Folder) {
  const all = loadFolders();
  const i = all.findIndex(f => f.id === folder.id);
  if (i >= 0) all[i] = folder;
  else all.push(folder);
  saveFolders(all);
  return folder;
}

export function getFolder(id: string) {
  return loadFolders().find(f => f.id === id);
}