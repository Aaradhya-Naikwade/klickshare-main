

// "use client";

// import { useState } from "react";
// import { getToken } from "@/lib/auth";
// import { toast } from "sonner";

// import {
//   Upload,
//   Image,
//   Loader2,
//   CheckCircle,
// } from "lucide-react";

// export default function UploadPhotoTab({
//   groupId,
// }: {
//   groupId: string;
// }) {

//   const [uploading,
//     setUploading] =
//     useState(false);

//   const [preview,
//     setPreview] =
//     useState<string | null>(null);

//   async function handleUpload(
//     e: any
//   ) {

//     const file =
//       e.target.files[0];

//     if (!file) return;

//     setPreview(
//       URL.createObjectURL(file)
//     );

//     try {

//       setUploading(true);

//       const token =
//         getToken();
//       if (!token) {
//         throw new Error("Please login again");
//       }

//       const formData =
//         new FormData();

//       formData.append(
//         "file",
//         file
//       );

//       formData.append(
//         "groupId",
//         groupId
//       );

//       const res =
//         await fetch(
//           "/api/photos/upload",
//           {
//             method: "POST",
//             headers: {
//               Authorization:
//                 `Bearer ${token}`,
//             },
//             body:
//               formData,
//           }
//         );

//       const data =
//         await res.json();

//       if (!res.ok) {

//         throw new Error(
//           data.error
//         );

//       }

//       toast.success(
//         "Photo uploaded successfully"
//       );

//       setPreview(null);

//     } catch (err: any) {

//       toast.error(
//         err.message
//       );

//     } finally {

//       setUploading(false);

//     }

//   }

//   return (

//     <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-6">

//       {/* HEADER */}
//       <div className="flex items-center gap-2 mb-4">

//         <Upload className="w-5 h-5 text-[#0f766e]" />

//         <h2 className="text-lg font-semibold text-[#111827]">
//           Upload Photo
//         </h2>

//       </div>

//       {/* PREVIEW */}
//       {preview && (

//         <div className="mb-4">

//           <img
//             src={preview}
//             className="w-32 h-32 object-cover rounded-lg border border-[#b2dfdb]"
//           />

//         </div>

//       )}

//       {/* DROP AREA */}
//       <label
//         className="
//           border-2 border-dashed border-[#b2dfdb]
//           rounded-xl
//           p-8
//           flex flex-col items-center justify-center
//           cursor-pointer
//           hover:bg-[#e0f2f1]
//           transition
//         "
//       >

//         {uploading ? (

//           <>

//             <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-2" />

//             <div className="text-[#111827] font-medium">
//               Uploading photo...
//             </div>

//           </>

//         ) : (

//           <>

//             <div className="bg-[#e0f2f1] p-3 rounded-full mb-3">

//               <Image className="w-6 h-6 text-[#0f766e]" />

//             </div>

//             <div className="font-medium text-[#111827]">

//               Click to upload photo

//             </div>

//             <div className="text-sm text-[#6b7280] mt-1">

//               JPG, PNG supported

//             </div>

//           </>

//         )}

//         <input
//           type="file"
//           hidden
//           accept="image/*"
//           onChange={
//             handleUpload
//           }
//         />

//       </label>

//       {/* SUCCESS STATE */}
//       {!uploading && !preview && (

//         <div className="flex items-center gap-2 text-sm text-[#6b7280] mt-4">

//           <CheckCircle className="w-4 h-4 text-[#0f766e]" />

//           Uploaded photos will appear below

//         </div>

//       )}

//     </div>

//   );

// }









"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
}: {
  groupId: string;
}) {
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
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
        formData.append("file", file); // same backend logic
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
        throw new Error(data.error);
      }

      toast.success("All photos uploaded successfully");

      // Refresh same page after upload
      router.refresh();

      // Reset state
      setFiles([]);
      setPreviews([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 w-full">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-teal-100 p-3 rounded-full">
          <UploadCloud className="w-6 h-6 text-teal-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Photos
          </h2>
          <p className="text-sm text-gray-500">
            Select multiple images and upload them at once
          </p>
        </div>
      </div>

      {/* DROP AREA */}
      <label
        className="
          border-2 border-dashed border-gray-300
          rounded-xl
          p-10
          flex flex-col items-center justify-center
          cursor-pointer
          hover:bg-gray-50
          transition
        "
      >
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <ImageIcon className="w-8 h-8 text-gray-600" />
        </div>

        <p className="font-medium text-gray-800">
          Click to select photos
        </p>

        <p className="text-sm text-gray-500 mt-1">
          JPG, PNG • Multiple files supported
        </p>

        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
      </label>

      {/* PREVIEW GRID */}
      {previews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Selected Photos ({previews.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((src, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border"
              >
                <img
                  src={src}
                  className="w-full h-28 object-cover"
                />

                {/* Remove button */}
                {!uploading && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD BUTTON */}
      {previews.length > 0 && (
        <button
          onClick={handleUploadAll}
          disabled={uploading}
          className="
            mt-6 w-full
            bg-teal-600
            hover:bg-teal-700
            disabled:bg-gray-400
            text-white
            font-medium
            py-3
            rounded-xl
            flex items-center justify-center gap-2
            transition
          "
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading {files.length} photo(s)...
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5" />
              Upload All Photos
            </>
          )}
        </button>
      )}

      {/* FOOTER INFO */}
      {!uploading && previews.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-6">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          Uploaded photos will appear below after refresh
        </div>
      )}
    </div>
  );
}