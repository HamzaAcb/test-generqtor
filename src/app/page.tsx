"use client";

import React, { useEffect, useMemo, useState } from "react";
import { uid } from "@/lib/id";
import { fileToDataUrl, downscaleDataUrl } from "@/lib/images";
import { imagesToA4Pdf } from "@/lib/pdf";
import type { Folder, TestFile } from "@/types";

type View = "home" | "create" | "name" | "files" | "workspace";

export default function Page() {
  // -------- App State --------
  const [view, setView] = useState<View>("home");

  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("");

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [newTestName, setNewTestName] = useState("");

  const [folderSearch, setFolderSearch] = useState("");

  // -------- Persistence --------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("folders");
    if (raw) {
      try {
        setFolders(JSON.parse(raw));
      } catch {
        // if corrupted, reset
        setFolders([]);
      }
    }
  }, []);

  const saveFolders = (next: Folder[]) => {
    setFolders(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("folders", JSON.stringify(next));
    }
  };

  const currentFolder = useMemo(
    () => folders.find((f) => f.id === currentFolderId),
    [folders, currentFolderId]
  );

  // -------- Upload handlers --------
  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const all = Array.from(files);
    const results: string[] = [];
    for (const f of all) {
      const dataUrl = await fileToDataUrl(f);
      // scale to ~1600px on the long side for speed
      const scaled = await downscaleDataUrl(dataUrl, 1600);
      results.push(scaled);
    }
    setUploadedPhotos((prev) => [...prev, ...results]);
  }

  // -------- PDF --------
  async function handleDownload(test: TestFile) {
    const blob = await imagesToA4Pdf(test.images);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${test.name.replace(/\s+/g, "_")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // -------- Reusable bits --------
  const Header: React.FC<{
    title?: string;
    left?: React.ReactNode;
    right?: React.ReactNode;
  }> = ({ title, left, right }) => (
    <div
      className="flex"
      style={{
        marginBottom: 16,
        background: "#ffffffaa",
        backdropFilter: "blur(6px)",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <div>{left}</div>
      <div style={{ margin: "0 auto", fontWeight: 700, color: "#007f73" }}>
        {title}
      </div>
      <div>{right}</div>
    </div>
  );

  // ===================== HOME =====================
  if (view === "home") {
    return (
      <div className="container">
        <Header
          title="Strawberry Test"
          right={
            <button
              onClick={() => setView("files")}
              style={{ background: "#e3f5f1", color: "#006a60" }}
            >
              Folders
            </button>
          }
        />
        <div className="card" style={{ textAlign: "center", padding: "32px" }}>
          <h2 style={{ color: "#1f2937", marginBottom: 8 }}>Create a New Test</h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            Upload question photos, organize them by folder, and export to a
            printable PDF.
          </p>
          <div className="flex" style={{ justifyContent: "center" }}>
            <button onClick={() => setView("create")}>Create New Test</button>
          </div>
        </div>
        <p style={{ textAlign: "center", color: "#6b7280", marginTop: 12 }}>
          No login • All data stays on your device
        </p>
      </div>
    );
  }

  // ===================== CREATE (camera/docs) =====================
  if (view === "create") {
    return (
      <div className="container">
        <Header
          title="Upload Questions"
          left={
            <button
              onClick={() => {
                setUploadedPhotos([]);
                setView("home");
              }}
              style={{ background: "#f3f4f6", color: "#111827" }}
            >
              ← Home
            </button>
          }
        />

        {/* Camera / Docs tiles */}
        <div className="flex" style={{ gap: 12, marginBottom: 16 }}>
          <label
            className="card"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "28px 16px",
              background: "#efe7ff",
              borderColor: "#d9ccff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
            <div style={{ fontWeight: 600, color: "#4b5563" }}>Camera</div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => onFilesSelected(e.currentTarget.files)}
              style={{ display: "none" }}
            />
          </label>

          <label
            className="card"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "28px 16px",
              background: "#fff3cd",
              borderColor: "#ffe69c",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>📁</div>
            <div style={{ fontWeight: 600, color: "#4b5563" }}>Docs / Gallery</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFilesSelected(e.currentTarget.files)}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Tip */}
        <div
          className="card"
          style={{
            background: "#f9fdfa",
            borderColor: "#d1eae3",
            color: "#374151",
          }}
        >
          Tip: Use your phone camera or upload from your gallery. Images will be
          compressed automatically for faster PDF generation.
        </div>

        {/* Uploaded previews */}
        {uploadedPhotos.length > 0 && (
          <>
            <h3 style={{ margin: "12px 0 6px", color: "#007f73" }}>
              Uploaded Images ({uploadedPhotos.length})
            </h3>
            <div className="grid" style={{ maxHeight: 260, overflowY: "auto" }}>
              {uploadedPhotos.map((src, i) => (
                <div key={i} className="card" style={{ padding: 6 }}>
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex" style={{ marginTop: 16 }}>
          <button
            onClick={() => {
              if (uploadedPhotos.length === 0) return;
              setView("name");
            }}
            disabled={uploadedPhotos.length === 0}
            style={{
              opacity: uploadedPhotos.length ? 1 : 0.5,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ===================== NAME (choose folder + set test name) =====================
  if (view === "name") {
    return (
      <div className="container">
        <Header
          title="Name Your Test"
          left={
            <button
              onClick={() => setView("create")}
              style={{ background: "#f3f4f6", color: "#111827" }}
            >
              ← Back
            </button>
          }
        />

        <div className="card">
          <label style={{ fontWeight: 600, color: "#374151" }}>Test name</label>
          <input
            placeholder="e.g., Math – Polynomials – Set 1"
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
          />
          <label style={{ fontWeight: 600, color: "#374151" }}>
            Save into folder
          </label>
          <select
            value={currentFolderId}
            onChange={(e) => setCurrentFolderId(e.target.value)}
          >
            <option value="">Select a folder…</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <div className="flex" style={{ justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                if (!newTestName.trim() || !currentFolderId) return;
                const folder = folders.find((f) => f.id === currentFolderId);
                if (!folder) return;

                const test: TestFile = {
                  id: uid(),
                  name: newTestName.trim(),
                  images: uploadedPhotos.map((dataUrl, idx) => ({
                    id: uid(),
                    dataUrl,
                    order: idx,
                  })),
                };

                const updated: Folder = {
                  ...folder,
                  tests: [...(folder.tests || []), test],
                };

                const all = folders.map((f) =>
                  f.id === folder.id ? updated : f
                );
                saveFolders(all);

                // reset transient state
                setUploadedPhotos([]);
                setNewTestName("");
                setView("workspace");
              }}
              disabled={!newTestName.trim() || !currentFolderId}
              style={{
                opacity: !newTestName.trim() || !currentFolderId ? 0.5 : 1,
              }}
            >
              Save Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== FILES (folders list & management) =====================
  if (view === "files") {
    return (
      <div className="container">
        <Header
          title="Folders"
          left={
            <button
              onClick={() => setView("home")}
              style={{ background: "#f3f4f6", color: "#111827" }}
            >
              ← Home
            </button>
          }
        />

        {/* Create folder */}
        <div className="card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.elements.namedItem(
                "folderName"
              ) as HTMLInputElement;
              const name = (input.value || "").trim();
              if (!name) return;
              const f: Folder = {
                id: uid(),
                name,
                createdAt: new Date().toISOString(),
                tests: [],
              };
              saveFolders([...folders, f]);
              input.value = "";
            }}
          >
            <label style={{ fontWeight: 600, color: "#374151" }}>
              New folder
            </label>
            <div className="flex">
              <input name="folderName" placeholder="e.g., Math" />
              <button type="submit">Add</button>
            </div>
          </form>
        </div>

        {/* Search */}
        <input
          placeholder="Search folders…"
          value={folderSearch}
          onChange={(e) => setFolderSearch(e.target.value)}
        />

        {/* Folder list */}
        {folders
          .filter((f) =>
            f.name.toLowerCase().includes(folderSearch.toLowerCase())
          )
          .map((folder) => (
            <div key={folder.id} className="card">
              <div className="flex">
                <input
                  value={folder.name}
                  onChange={(e) => {
                    const next = folders.map((f) =>
                      f.id === folder.id ? { ...f, name: e.target.value } : f
                    );
                    saveFolders(next);
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      setCurrentFolderId(folder.id);
                      setView("workspace");
                    }}
                    style={{ background: "#e3f5f1", color: "#006a60" }}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete folder "${folder.name}" and all its tests?`
                        )
                      ) {
                        saveFolders(folders.filter((f) => f.id !== folder.id));
                      }
                    }}
                    style={{
                      background: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ color: "#6b7280", marginTop: 6 }}>
                {folder.tests?.length || 0} tests
              </div>
            </div>
          ))}
      </div>
    );
  }

  // ===================== WORKSPACE (tests inside a folder) =====================
  const folder = currentFolder;

  return (
    <div className="container">
      <Header
        title={folder?.name || "Workspace"}
        left={
          <button
            onClick={() => setView("files")}
            style={{ background: "#f3f4f6", color: "#111827" }}
          >
            ← Folders
          </button>
        }
        right={
          <button
            onClick={() => {
              setView("create");
            }}
            style={{ background: "#e3f5f1", color: "#006a60" }}
          >
            + New Test
          </button>
        }
      />

      {!folder || (folder.tests || []).length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          No tests yet in this folder.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {folder.tests.map((test) => (
            <div key={test.id} className="card">
              <div className="flex">
                <input
                  value={test.name}
                  onChange={(e) => {
                    const next = folders.map((f) =>
                      f.id === folder.id
                        ? {
                            ...f,
                            tests: f.tests.map((t) =>
                              t.id === test.id
                                ? { ...t, name: e.target.value }
                                : t
                            ),
                          }
                        : f
                    );
                    saveFolders(next);
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleDownload(test)}>
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete test "${test.name}"?`)) {
                        const next = folders.map((f) =>
                          f.id === folder.id
                            ? {
                                ...f,
                                tests: f.tests.filter((t) => t.id !== test.id),
                              }
                            : f
                        );
                        saveFolders(next);
                      }
                    }}
                    style={{ background: "#fee2e2", color: "#991b1b" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Tiny thumbnails row */}
              {test.images && test.images.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 8,
                    overflowX: "auto",
                  }}
                >
                  {test.images.slice(0, 8).map((img) => (
                    <img
                      key={img.id}
                      src={img.dataUrl}
                      alt="thumb"
                      style={{
                        height: 56,
                        width: 80,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ))}
                  {test.images.length > 8 && (
                    <div
                      style={{
                        padding: "12px 8px",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      +{test.images.length - 8} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
