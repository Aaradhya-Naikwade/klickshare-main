"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  Download,
  Sparkles,
  Images,
  Loader2,
} from "lucide-react";

type FaceMatch = {
  _id?: string;
  photoUrl: string;
  group?: { name?: string } | null;
  groupId?: { name?: string } | null;
  groupName?: string;
};

export default function MyPhotosTab() {
  const [photos, setPhotos] = useState<FaceMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    async function run() {
      try {
        const token = getToken();

        if (!token) {
          if (isMounted) {
            setPhotos([]);
            setLoading(false);
          }
          return;
        }

        const res = await fetch("/api/photos/my-face", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (isMounted) {
          setPhotos(data.matches || []);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setPhotos([]);
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [photos.length]);

  async function handleDownload(
    photoId?: string
  ) {
    if (!photoId) return;

    const token = getToken();
    if (!token) return;

    const res = await fetch(
      "/api/photos/download",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photoId }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.url) {
      return;
    }

    const a = document.createElement("a");
    a.href = data.url;
    a.download = "photo.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function toggleSelect(photoId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }

  async function handleBulkDownload() {
    const token = getToken();
    if (!token) return;

    const photoIds = Array.from(selectedIds);
    if (photoIds.length === 0) return;

    const res = await fetch(
      "/api/photos/bulk-download",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photoIds }),
      }
    );

    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "photos.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-3" />
          <div className="font-medium text-[#111827]">
            Finding your photos...
          </div>
        </div>
      </div>
    );

  if (photos.length === 0)
    return (
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-10 text-center shadow-sm">
        <Sparkles className="w-10 h-10 text-[#0f766e] mx-auto mb-3" />
        <div className="font-semibold text-[#111827]">
          No photos found
        </div>
        <div className="text-sm text-[#6b7280] mt-1">
          Your matched photos will appear here
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
          <Images className="w-6 h-6" />
          My Photos
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-[#6b7280]">
            {selectedIds.size} selected
          </div>
          <button
            onClick={handleBulkDownload}
            disabled={selectedIds.size === 0}
            className="bg-[#0f766e] hover:bg-[#0b5e58] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg"
          >
            Download Selected
          </button>
        </div>
        <p className="text-sm text-[#6b7280] mt-1 w-full">
          Photos where you were detected
        </p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((p, i) => {
          const groupName =
            p.group?.name ||
            p.groupId?.name ||
            p.groupName ||
            "Event Group";

          return (
            <div
              key={p._id || i}
              className="relative break-inside-avoid group overflow-hidden rounded-2xl bg-white border border-[#b2dfdb] shadow-sm hover:shadow-xl transition duration-300"
            >
              <button
                onClick={() => {
                  if (p._id) toggleSelect(p._id);
                }}
                className="
                  absolute top-2 left-2 z-10
                  w-6 h-6
                  rounded
                  border border-white
                  bg-white/80
                  flex items-center justify-center
                  text-xs
                  shadow
                "
                aria-label="Select photo"
              >
                {p._id && selectedIds.has(p._id)
                  ? "✓"
                  : ""}
              </button>
              <img
                src={p.photoUrl}
                alt="matched face"
                className="w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div
                className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-black/70 via-black/20 to-transparent
                  opacity-0
                  group-hover:opacity-100
                  transition duration-300
                "
              />

              <div
                className="
                  absolute bottom-0 left-0 right-0
                  translate-y-full
                  group-hover:translate-y-0
                  transition duration-300
                  p-4
                "
              >
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-200">
                      Group
                    </p>
                    <p className="text-sm font-semibold text-white truncate">
                      {groupName}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload(p._id)
                    }
                    className="
                      w-9 h-9
                      flex items-center justify-center
                      rounded-lg
                      bg-white/20
                      hover:bg-white/30
                      text-white
                      transition
                    "
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
