


// "use client";

// import { useState } from "react";
// import { getToken } from "@/lib/auth";

// // NEW IMPORT
// import CaptureProfilePhoto from "@/components/CaptureProfilePhoto";

// export default function ProfileTab({
//   user,
// }: {
//   user: any;
// }) {

//   const [editMode, setEditMode] =
//     useState(false);

//   const [name, setName] =
//     useState(user.name || "");

//   const [companyName, setCompanyName] =
//     useState(user.companyName || "");

//   const [photo, setPhoto] =
//     useState(user.profilePhoto || "");

//   const [loading, setLoading] =
//     useState(false);

//   const [uploading, setUploading] =
//     useState(false);

//   // NEW STATE
//   const [showCamera, setShowCamera] =
//     useState(false);

//   const token = getToken();

//   async function saveProfile() {

//     try {

//       setLoading(true);

//       await fetch(
//         "/api/user/update-profile",
//         {
//           method: "PUT",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify({
//             token,
//             name,
//             companyName,
//           }),

//         }
//       );

//       setEditMode(false);

//       alert(
//         "Profile updated successfully"
//       );

//     }
//     catch {

//       alert(
//         "Failed to update profile"
//       );

//     }
//     finally {

//       setLoading(false);

//     }

//   }

//   return (

//     <div className="max-w-3xl">

//       {/* CAMERA POPUP */}
//       {showCamera && (

//         <CaptureProfilePhoto

//           onClose={() =>
//             setShowCamera(false)
//           }

//           onSuccess={(url: string) => {

//             setPhoto(url);

//             setShowCamera(false);

//           }}

//         />

//       )}

//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">

//         <h1 className="text-2xl font-bold text-black">
//           My Profile
//         </h1>

//         {!editMode ? (

//           <button
//             onClick={() =>
//               setEditMode(true)
//             }
//             className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
//           >
//             Edit Profile
//           </button>

//         ) : (

//           <button
//             onClick={saveProfile}
//             disabled={loading}
//             className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
//           >
//             {loading
//               ? "Saving..."
//               : "Save Changes"}
//           </button>

//         )}

//       </div>

//       {/* Profile Card */}
//       <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">

//         {/* Photo Section */}
//         <div className="flex items-center gap-6 mb-8">

//           <div className="relative">

//             <img
//               src={
//                 photo ||
//                 "https://ui-avatars.com/api/?name=" +
//                   name
//               }
//               className="w-24 h-24 rounded-full object-cover border"
//             />

//             {uploading && (

//               <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm rounded-full">
//                 Uploading...
//               </div>

//             )}

//           </div>

//           {/* UPDATED CHANGE PHOTO BUTTON */}
//           {editMode && (

//             <button
//               onClick={() =>
//                 setShowCamera(true)
//               }
//               className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-black"
//             >
//               Capture Photo
//             </button>

//           )}

//         </div>

//         {/* Form Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//           {/* Name */}
//           <div>

//             <label className="text-sm font-medium text-gray-700">
//               Name
//             </label>

//             <input
//               value={name}
//               disabled={!editMode}
//               onChange={(e) =>
//                 setName(
//                   e.target.value
//                 )
//               }
//               className={`w-full mt-1 p-3 border rounded-lg text-black ${
//                 !editMode
//                   ? "bg-gray-100"
//                   : ""
//               }`}
//             />

//           </div>

//           {/* Company Name */}
//           {user.role ===
//             "photographer" && (

//             <div>

//               <label className="text-sm font-medium text-gray-700">
//                 Company Name
//               </label>

//               <input
//                 value={companyName}
//                 disabled={!editMode}
//                 onChange={(e) =>
//                   setCompanyName(
//                     e.target.value
//                   )
//                 }
//                 className={`w-full mt-1 p-3 border rounded-lg text-black ${
//                   !editMode
//                     ? "bg-gray-100"
//                     : ""
//                 }`}
//               />

//             </div>

//           )}

//           {/* Phone */}
//           <div>

//             <label className="text-sm font-medium text-gray-700">
//               Mobile Number
//             </label>

//             <input
//               value={user.phone}
//               disabled
//               className="w-full mt-1 p-3 border rounded-lg bg-gray-100 text-black"
//             />

//           </div>

//           {/* Role */}
//           <div>

//             <label className="text-sm font-medium text-gray-700">
//               Role
//             </label>

//             <input
//               value={user.role}
//               disabled
//               className="w-full mt-1 p-3 border rounded-lg bg-gray-100 text-black capitalize"
//             />

//           </div>

//         </div>

//       </div>

//     </div>

//   );

// }












"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";
import CaptureProfilePhoto from "@/components/CaptureProfilePhoto";
import { toast } from "sonner";
import {
  User,
  Building2,
  Phone,
  Shield,
  Camera,
  Pencil,
  Save,
  Loader2,
} from "lucide-react";

export default function ProfileTab({
  user,
}: {
  user: any;
}) {
  const [editMode, setEditMode] =
    useState(false);

  const [name, setName] =
    useState(user.name || "");

  const [companyName, setCompanyName] =
    useState(user.companyName || "");

  const [photo, setPhoto] =
    useState(user.profilePhoto || "");

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [showCamera, setShowCamera] =
    useState(false);

  const token = getToken();

  async function saveProfile() {
    try {
      setLoading(true);
      if (!token) {
        throw new Error("Please login again");
      }

      await fetch(
        "/api/user/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            companyName,
          }),
        }
      );

      setEditMode(false);

      toast.success(
        "Profile updated successfully"
      );
    } catch {
      toast.error(
        "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">

      {/* CAMERA */}
      {showCamera && (
        <CaptureProfilePhoto
          onClose={() =>
            setShowCamera(false)
          }
          onSuccess={(url: string) => {
            setPhoto(url);
            setShowCamera(false);
            toast.success(
              "Profile photo updated"
            );
          }}
        />
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
            <User className="w-6 h-6" />
            My Profile
          </h1>

          <p className="text-[#6b7280] text-sm mt-1">
            Manage your personal information
          </p>
        </div>

        {!editMode ? (
          <button
            onClick={() =>
              setEditMode(true)
            }
            className="bg-[#0f766e] hover:bg-[#0b5e58] text-white px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={saveProfile}
            disabled={loading}
            className="bg-[#0f766e] hover:bg-[#0b5e58] text-white px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-8 shadow-sm">

        {/* PHOTO */}
        <div className="flex items-center gap-6 mb-8">

          <div className="relative">

            <img
              src={
                photo ||
                "https://ui-avatars.com/api/?name=" +
                  name
              }
              className="w-24 h-24 rounded-full object-cover border border-[#b2dfdb] shadow-sm"
            />

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </div>
            )}

          </div>

          {editMode && (
            <button
              onClick={() =>
                setShowCamera(true)
              }
              className="flex items-center gap-2 bg-[#e0f2f1] hover:bg-[#ccebea] text-[#0f766e] px-4 py-2 rounded-lg border border-[#b2dfdb] transition"
            >
              <Camera className="w-4 h-4" />
              Capture Photo
            </button>
          )}

        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* NAME */}
          <div>

            <label className="text-sm font-medium text-[#111827] flex items-center gap-2">
              <User className="w-4 h-4 text-[#0f766e]" />
              Name
            </label>

            <input
              value={name}
              disabled={!editMode}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className={`w-full mt-1 p-3 border border-[#b2dfdb] rounded-lg text-[#111827] focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] ${
                !editMode
                  ? "bg-gray-50"
                  : "bg-white"
              }`}
            />

          </div>

          {/* COMPANY */}
          {user.role ===
            "photographer" && (
            <div>

              <label className="text-sm font-medium text-[#111827] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0f766e]" />
                Company Name
              </label>

              <input
                value={companyName}
                disabled={!editMode}
                onChange={(e) =>
                  setCompanyName(
                    e.target.value
                  )
                }
                className={`w-full mt-1 p-3 border border-[#b2dfdb] rounded-lg text-[#111827] focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] ${
                  !editMode
                    ? "bg-gray-50"
                    : "bg-white"
                }`}
              />

            </div>
          )}

          {/* PHONE */}
          <div>

            <label className="text-sm font-medium text-[#111827] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0f766e]" />
              Mobile Number
            </label>

            <input
              value={user.phone}
              disabled
              className="w-full mt-1 p-3 border border-[#b2dfdb] rounded-lg bg-gray-50 text-[#111827]"
            />

          </div>

          {/* ROLE */}
          <div>

            <label className="text-sm font-medium text-[#111827] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0f766e]" />
              Role
            </label>

            <input
              value={user.role}
              disabled
              className="w-full mt-1 p-3 border border-[#b2dfdb] rounded-lg bg-gray-50 text-[#111827] capitalize"
            />

          </div>

        </div>

      </div>

    </div>
  );
}
