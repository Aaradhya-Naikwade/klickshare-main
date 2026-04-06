"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import {
  Check,
  Download,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from "lucide-react";

export default function GroupPhotosTab({
  groupId,
  refreshToken = 0,
  onPhotosLoaded,
}: {
  groupId: string;
  refreshToken?: number;
  onPhotosLoaded?: (count: number) => void;
}) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

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
    try {
      setLoading(true);

      const res = await fetch(`/api/photos/group?groupId=${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load photos");
      }

      const nextPhotos = data.photos || [];
      setPhotos(nextPhotos);
      onPhotosLoaded?.(nextPhotos.length);
    } catch (err: any) {
      toast.error(err.message || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPhotos();
    void loadUserRole();
  }, [groupId, refreshToken]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [photos.length]);

  const selectedCount = selectedIds.size;

  const sortedPhotos = useMemo(
    () =>
      [...photos].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      ),
    [photos]
  );

  async function handleDownload(photoId?: string) {
    if (!photoId || !token) return;

    const res = await fetch("/api/photos/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photoId }),
    });

    const data = await res.json();

    if (!res.ok || !data?.url) {
      toast.error("Failed to download photo");
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
    if (!token || selectedCount === 0) return;

    const photoIds = Array.from(selectedIds);
    const res = await fetch("/api/photos/bulk-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photoIds }),
    });

    if (!res.ok) {
      toast.error("Failed to download selected photos");
      return;
    }

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

  function requestDelete(photoId: string) {
    setDeleteTargetIds([photoId]);
    setShowDeleteModal(true);
  }

  function requestBulkDelete() {
    if (selectedCount === 0) return;
    setDeleteTargetIds(Array.from(selectedIds));
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    if (!token || deleteTargetIds.length === 0) {
      return;
    }

    try {
      setDeleting(true);

      if (deleteTargetIds.length === 1) {
        const photoId = deleteTargetIds[0];
        const res = await fetch("/api/photos/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ photoId }),
        });

        if (!res.ok) {
          throw new Error("Failed to delete photo");
        }

        toast.success("Photo deleted");
        setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(photoId);
          return next;
        });
      } else {
        const res = await fetch("/api/photos/bulk-delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ photoIds: deleteTargetIds }),
        });

        if (!res.ok) {
          throw new Error("Failed to delete selected photos");
        }

        const data = await res.json();
        const deletedIds: string[] = data.deleted || [];

        if (deletedIds.length > 0) {
          toast.success("Selected photos deleted");
          setPhotos((prev) => prev.filter((photo) => !deletedIds.includes(photo._id)));
          setSelectedIds(new Set());
        }
      }

      setShowDeleteModal(false);
      setDeleteTargetIds([]);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex flex-col items-center rounded-[24px] border border-[#3cc2bf]/20 bg-white px-8 py-8 shadow-sm">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#1f6563]" />
          <div className="text-sm font-medium text-slate-700">
            Loading photos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 border-b border-[#3cc2bf]/15 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Group Photos
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review uploaded images, download what you need, and clean up the gallery when required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-[#3cc2bf]/15 bg-[#f8fcfc] px-4 py-3 text-sm font-medium text-slate-600">
            {selectedCount} selected
          </div>
          <button
            onClick={handleBulkDownload}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#3cc2bf]/20 bg-[#f8fcfc] px-4 py-3 text-sm font-medium text-[#1f6563] transition hover:bg-[#eef8f8] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Download className="h-4 w-4" />
            Download Selected
          </button>
          {isPhotographer && (
            <button
              onClick={requestBulkDelete}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {sortedPhotos.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#3cc2bf]/25 bg-[#f8fcfc] px-6 py-12 text-center">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-[#1f6563]" />
          <div className="text-lg font-semibold text-slate-900">
            No photos yet
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Upload photos above and they will appear here.
          </div>
        </div>
      ) : (
        <div className="grid auto-rows-[140px] grid-cols-2 gap-4 md:auto-rows-[170px] md:grid-cols-4">
          {sortedPhotos.map((photo, index) => (
            <div
              key={photo._id}
              className={`group relative overflow-hidden rounded-[24px] border border-[#3cc2bf]/15 bg-[#fcfefe] shadow-sm transition hover:shadow-md ${
                index % 7 === 0
                  ? "col-span-2 row-span-2"
                  : index % 5 === 0
                    ? "row-span-2"
                    : "col-span-1 row-span-1"
              }`}
            >
              <img
                src={photo.photoUrl}
                alt="Group photo"
                className="h-full w-full object-cover"
              />

              <button
                type="button"
                onClick={() => toggleSelect(photo._id)}
                className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl border text-white shadow-sm transition ${
                  selectedIds.has(photo._id)
                    ? "border-[#1f6563] bg-[#1f6563]"
                    : "border-white/70 bg-white/80 text-slate-500 hover:bg-white"
                }`}
                aria-label="Select photo"
              >
                {selectedIds.has(photo._id) && <Check className="h-4 w-4" />}
              </button>

              <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDownload(photo._id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/88 text-slate-700 shadow-sm transition hover:bg-white"
                  aria-label="Download photo"
                >
                  <Download className="h-4 w-4" />
                </button>

                {isPhotographer && (
                  <button
                    type="button"
                    onClick={() => requestDelete(photo._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/88 text-red-600 shadow-sm transition hover:bg-white"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />

            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          title={deleteTargetIds.length > 1 ? "Delete Photos" : "Delete Photo"}
          message={
            deleteTargetIds.length > 1
              ? `This will permanently delete ${deleteTargetIds.length} selected photos.`
              : "This will permanently delete this photo."
          }
          loading={deleting}
          onCancel={() => {
            if (deleting) return;
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
