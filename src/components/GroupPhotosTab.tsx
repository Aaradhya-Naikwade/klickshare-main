"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { Download, Trash2 } from "lucide-react";

export default function GroupPhotosTab({
  groupId,
}: {
  groupId: string;
}) {

  const [photos, setPhotos] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());

  const [isPhotographer, setIsPhotographer] =
    useState(false);

  const token = getToken();

  async function loadUserRole() {
    if (!token) return;

    const res = await fetch("/api/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;
    const data = await res.json();
    setIsPhotographer(data?.role === "photographer");
  }

  async function loadPhotos() {

    const res = await fetch(
      `/api/photos/group?groupId=${groupId}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await res.json();

    setPhotos(data.photos || []);

    setLoading(false);

  }

  useEffect(() => {
    loadPhotos();
    loadUserRole();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [photos.length]);

  async function handleDownload(
    photoId?: string
  ) {
    if (!photoId || !token) return;

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

  async function handleDelete(photoId: string) {
    if (!token) return;
    const confirmed = window.confirm(
      "Delete this photo permanently?"
    );
    if (!confirmed) return;

    const res = await fetch("/api/photos/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photoId }),
    });

    if (!res.ok) return;
    setPhotos((prev) =>
      prev.filter((p) => p._id !== photoId)
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });
  }

  async function handleBulkDelete() {
    if (!token) return;
    const photoIds = Array.from(selectedIds);
    if (photoIds.length === 0) return;
    const confirmed = window.confirm(
      `Delete ${photoIds.length} selected photos?`
    );
    if (!confirmed) return;

    const res = await fetch("/api/photos/bulk-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photoIds }),
    });

    if (!res.ok) return;
    const data = await res.json();
    const deletedIds: string[] = data.deleted || [];

    if (deletedIds.length > 0) {
      setPhotos((prev) =>
        prev.filter((p) => !deletedIds.includes(p._id))
      );
      setSelectedIds(new Set());
    }
  }

  if (loading)
    return (
      <div>
        Loading photos...
      </div>
    );

  if (photos.length === 0)
    return (
      <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
        No photos yet
      </div>
    );

  return (
    <div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-black">
          Group Photos
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {selectedIds.size} selected
          </div>
          <button
            onClick={handleBulkDownload}
            disabled={selectedIds.size === 0}
            className="bg-[#0f766e] hover:bg-[#0b5e58] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg"
          >
            Download Selected
          </button>
          {isPhotographer && (
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg"
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {photos.map(
          (photo) => (

            <div
              key={
                photo._id
              }
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md relative group"
            >

              <img
                src={
                  photo.photoUrl
                }
                className="w-full h-48 object-cover"
              />

              <button
                onClick={() =>
                  toggleSelect(photo._id)
                }
                className="
                  absolute top-2 left-2
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
                {selectedIds.has(photo._id)
                  ? "✓"
                  : ""}
              </button>

              <button
                onClick={() =>
                  handleDownload(photo._id)
                }
                className="
                  absolute top-2 right-2
                  w-8 h-8
                  flex items-center justify-center
                  rounded-lg
                  bg-white/80
                  hover:bg-white
                  text-gray-700
                  shadow
                  opacity-0
                  group-hover:opacity-100
                  transition
                "
                aria-label="Download photo"
              >
                <Download className="w-4 h-4" />
              </button>

              {isPhotographer && (
                <button
                  onClick={() =>
                    handleDelete(photo._id)
                  }
                  className="
                  absolute top-2 right-12
                  w-8 h-8
                  flex items-center justify-center
                  rounded-lg
                  bg-white/80
                  hover:bg-white
                  text-red-600
                  shadow
                  opacity-0
                  group-hover:opacity-100
                  transition
                "
                  aria-label="Delete photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="p-2 text-xs text-gray-500">

                {new Date(
                  photo.createdAt
                ).toLocaleDateString()}

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}
