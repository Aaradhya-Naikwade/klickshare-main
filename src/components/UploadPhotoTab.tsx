"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

export default function UploadPhotoTab({
  groupId,
  onUploadSuccess,
}: {
  groupId: string;
  onUploadSuccess?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    setPreviews(
      selectedFiles.map((file) => URL.createObjectURL(file))
    );
  }

  function removeImage(index: number) {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  }

  async function handleUploadAll() {
    if (files.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    try {
      setUploading(true);

      const token = getToken();
      if (!token) throw new Error("Please login again");

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });
      formData.append("groupId", groupId);

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("All photos uploaded successfully");
      setFiles([]);
      setPreviews([]);
      onUploadSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-[#3cc2bf]/12 p-3">
          <UploadCloud className="h-6 w-6 text-[#1f6563]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Upload Photos
          </h2>
          <p className="text-sm text-slate-500">
            Select multiple images and upload them at once.
          </p>
        </div>
      </div>

      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#3cc2bf]/25 bg-[#f8fcfc] p-10 text-center transition hover:bg-[#f2fbfb]"
      >
        <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
          <ImageIcon className="h-8 w-8 text-[#1f6563]" />
        </div>

        <p className="font-medium text-slate-800">
          Click to select photos
        </p>

        <p className="mt-1 text-sm text-slate-500">
          JPG, PNG and multiple files supported
        </p>

        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-slate-700">
              Selected Photos ({previews.length})
            </h3>
            <div className="rounded-full bg-[#f8fcfc] px-3 py-1 text-xs font-medium text-slate-500">
              Ready to upload
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {previews.map((src, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[24px] border border-[#3cc2bf]/15 bg-[#f8fcfc] shadow-sm"
              >
                <img
                  src={src}
                  alt={`Selected photo ${index + 1}`}
                  className="h-36 w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />

                <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  Photo {index + 1}
                </div>

                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <button
          onClick={handleUploadAll}
          disabled={uploading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f6563] py-3 font-medium text-white transition hover:bg-[#174d4b] disabled:bg-slate-400"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading {files.length} photo(s)...
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              Upload All Photos
            </>
          )}
        </button>
      )}

      {!uploading && previews.length === 0 && (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-[#1f6563]" />
          Uploaded photos appear in the gallery below.
        </div>
      )}
    </div>
  );
}
