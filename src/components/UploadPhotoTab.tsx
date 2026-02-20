// "use client";

// import { useState } from "react";
// import { getToken } from "@/lib/auth";

// export default function UploadPhotoTab({
//   groupId,
// }: {
//   groupId: string;
// }) {

//   const [uploading,
//     setUploading] =
//     useState(false);

//   const [success,
//     setSuccess] =
//     useState("");

//   const [error,
//     setError] =
//     useState("");

//   async function handleUpload(
//     e: any
//   ) {

//     const file =
//       e.target.files[0];

//     if (!file) return;

//     try {

//       setUploading(true);

//       const token =
//         getToken();

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

//       formData.append(
//         "token",
//         token!
//       );

//       const res =
//         await fetch(
//           "/api/photos/upload",
//           {
//             method: "POST",
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

//       setSuccess(
//         "Photo uploaded successfully"
//       );

//     } catch (err: any) {

//       setError(
//         err.message
//       );

//     } finally {

//       setUploading(false);

//     }

//   }

//   return (
//     <div>

//       <h2 className="text-xl font-bold text-black mb-4">
//         Upload Photo
//       </h2>

//       {success && (
//         <div className="bg-green-50 text-green-600 p-3 mb-4">
//           {success}
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 text-red-600 p-3 mb-4">
//           {error}
//         </div>
//       )}

//       <label className="bg-blue-600 text-white px-6 py-3 rounded cursor-pointer">

//         {uploading
//           ? "Uploading..."
//           : "Select Photo"}

//         <input
//           type="file"
//           hidden
//           onChange={
//             handleUpload
//           }
//         />

//       </label>

//     </div>
//   );
// }







"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

import {
  Upload,
  Image,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function UploadPhotoTab({
  groupId,
}: {
  groupId: string;
}) {

  const [uploading,
    setUploading] =
    useState(false);

  const [preview,
    setPreview] =
    useState<string | null>(null);

  async function handleUpload(
    e: any
  ) {

    const file =
      e.target.files[0];

    if (!file) return;

    setPreview(
      URL.createObjectURL(file)
    );

    try {

      setUploading(true);

      const token =
        getToken();
      if (!token) {
        throw new Error("Please login again");
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "groupId",
        groupId
      );

      const res =
        await fetch(
          "/api/photos/upload",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body:
              formData,
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        throw new Error(
          data.error
        );

      }

      toast.success(
        "Photo uploaded successfully"
      );

      setPreview(null);

    } catch (err: any) {

      toast.error(
        err.message
      );

    } finally {

      setUploading(false);

    }

  }

  return (

    <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-6">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">

        <Upload className="w-5 h-5 text-[#0f766e]" />

        <h2 className="text-lg font-semibold text-[#111827]">
          Upload Photo
        </h2>

      </div>

      {/* PREVIEW */}
      {preview && (

        <div className="mb-4">

          <img
            src={preview}
            className="w-32 h-32 object-cover rounded-lg border border-[#b2dfdb]"
          />

        </div>

      )}

      {/* DROP AREA */}
      <label
        className="
          border-2 border-dashed border-[#b2dfdb]
          rounded-xl
          p-8
          flex flex-col items-center justify-center
          cursor-pointer
          hover:bg-[#e0f2f1]
          transition
        "
      >

        {uploading ? (

          <>

            <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-2" />

            <div className="text-[#111827] font-medium">
              Uploading photo...
            </div>

          </>

        ) : (

          <>

            <div className="bg-[#e0f2f1] p-3 rounded-full mb-3">

              <Image className="w-6 h-6 text-[#0f766e]" />

            </div>

            <div className="font-medium text-[#111827]">

              Click to upload photo

            </div>

            <div className="text-sm text-[#6b7280] mt-1">

              JPG, PNG supported

            </div>

          </>

        )}

        <input
          type="file"
          hidden
          accept="image/*"
          onChange={
            handleUpload
          }
        />

      </label>

      {/* SUCCESS STATE */}
      {!uploading && !preview && (

        <div className="flex items-center gap-2 text-sm text-[#6b7280] mt-4">

          <CheckCircle className="w-4 h-4 text-[#0f766e]" />

          Uploaded photos will appear below

        </div>

      )}

    </div>

  );

}
