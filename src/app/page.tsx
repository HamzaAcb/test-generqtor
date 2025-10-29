"use client";
import { useEffect, useMemo, useState } from "react";
import { uid } from "@/lib/id";
import { Folder, ImageItem } from "@/types";
import { loadFolders, upsertFolder } from "@/lib/storage";
import { fileToDataUrl, downscaleDataUrl } from "@/lib/images";
import { imagesToA4Pdf } from "@/lib/pdf";

export default function Page() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const current = useMemo(
    () => folders.find((f) => f.id === currentId),
    [folders, currentId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFolders(loadFolders());
  }, []);

  function createFolder(name: string) {
    if (!name.trim()) return;
    const f: Folder = {
      id: uid(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      images: [],
    };
    upsertFolder(f);
    setFolders(loadFolders());
    setCurrentId(f.id);
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files || !current) return;
    const limitLeft = Math.max(0, 25 - current.images.length);
    const arr = Array.from(files).slice(0, limitLeft);
    const baseOrder = current.images.length;
    const items: ImageItem[] = [];
    for (let i = 0; i < arr.length; i++) {
      const dataUrl = await fileToDataUrl(arr[i]);
      const scaled = await downscaleDataUrl(dataUrl, 1600);
      items.push({ id: uid(), dataUrl: scaled, order: baseOrder + i });
    }
    const updated: Folder = { ...current, images: [...current.images, ...items] };
    upsertFolder(updated);
    setFolders(loadFolders());
  }

  function deleteImage(id: string) {
    if (!current) return;
    const images = current.images
      .filter((x) => x.id !== id)
      .map((x, i) => ({ ...x, order: i }));
    upsertFolder({ ...current, images });
    setFolders(loadFolders());
  }

  function move(id: string, dir: -1 | 1) {
    if (!current) return;
    const imgs = [...current.images].sort((a, b) => a.order - b.order);
    const idx = imgs.findIndex((x) => x.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= imgs.length) return;
    [imgs[idx].order, imgs[swap].order] = [imgs[swap].order, imgs[idx].order];
    const renum = imgs
      .sort((a, b) => a.order - b.order)
      .map((x, i) => ({ ...x, order: i }));
    upsertFolder({ ...current, images: renum });
    setFolders(loadFolders());
  }

  async function generatePdf() {
    if (!current || current.images.length === 0) return;
    const images = [...current.images].sort((a, b) => a.order - b.order);
    const blob = await imagesToA4Pdf(images);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.name.replace(/\s+/g, "_")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-10">
      {/* Folder Section */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 transition hover:shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded-lg border border-gray-300 p-2 text-gray-800 focus:border-green-600 focus:ring-2 focus:ring-green-100"
            value={currentId}
            onChange={(e) => setCurrentId(e.target.value)}
          >
            <option value="">Select Folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = (
                e.currentTarget.elements.namedItem("name") as HTMLInputElement
              ).value.trim();
              if (name) {
                createFolder(name);
                (e.currentTarget as HTMLFormElement).reset();
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              name="name"
              placeholder="New folder name"
              className="rounded-lg border border-gray-300 p-2 text-gray-800 focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
            <button className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-2 font-medium text-white shadow-md hover:shadow-lg hover:brightness-110 transition">
              Create
            </button>
          </form>

          <div className="ml-auto text-sm text-gray-600">
            {current ? `${current.images.length} images` : "No folder selected"}
          </div>
        </div>
      </section>

      {/* Upload Box */}
      <section className="rounded-2xl bg-white p-10 shadow-lg ring-1 ring-gray-100 text-center hover:shadow-xl transition">
        <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-white p-10 hover:border-green-500 hover:bg-green-50 cursor-pointer transition">
          <span className="text-5xl mb-3">📸</span>
          <span className="text-gray-700 font-medium">
            Click or drop images here
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            capture="environment"
            onChange={(e) => onFilesSelected(e.currentTarget.files)}
            className="hidden"
          />
        </label>
        <p className="mt-3 text-sm text-gray-500">
          Tip: Use your camera or gallery — images are automatically optimized.
        </p>
      </section>

      {/* Image Grid */}
      {current && (
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 transition hover:shadow-xl">
          <h2 className="mb-4 text-lg font-semibold text-green-700">
            Uploaded Images
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {[...current.images]
              .sort((a, b) => a.order - b.order)
              .map((img) => (
                <div
                  key={img.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={img.dataUrl}
                    className="h-44 w-full object-cover"
                    alt="Preview"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/60 p-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => move(img.id, -1)}
                      className="text-xs text-white px-2"
                    >
                      ◀
                    </button>
                    <span className="text-[10px] text-white">
                      #{img.order + 1}
                    </span>
                    <button
                      onClick={() => move(img.id, 1)}
                      className="text-xs text-white px-2"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="ml-auto text-xs text-red-300 px-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Generate Button */}
      <div className="sticky bottom-6 z-20 flex justify-end">
        <button
          onClick={generatePdf}
          disabled={!current || current.images.length === 0}
          className="rounded-full bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110 disabled:opacity-40 transition"
        >
          Generate PDF (A4)
        </button>
      </div>
    </main>
  );
}
