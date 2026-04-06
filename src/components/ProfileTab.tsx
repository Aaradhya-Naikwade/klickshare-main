


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

import { useEffect, useMemo, useState } from "react";
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
  HardDrive,
  CreditCard,
  CalendarDays,
  CheckCircle2,
  ArrowUpRight,
  X,
} from "lucide-react";

type PlanStatus = {
  planKey: string;
  planStart: string;
  planEnd: string;
  quota: number;
  used: number;
  remaining: number;
  priceInr: number;
};

type Plan = {
  key: string;
  label: string;
  priceInr: number;
  quota: number;
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

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
  const [showCamera, setShowCamera] =
    useState(false);
  const [planStatus, setPlanStatus] =
    useState<PlanStatus | null>(null);
  const [plans, setPlans] =
    useState<Plan[]>([]);
  const [billingLoading, setBillingLoading] =
    useState(user.role === "photographer");
  const [plansLoading, setPlansLoading] =
    useState(false);
  const [showUpgradeModal, setShowUpgradeModal] =
    useState(false);
  const [payingPlan, setPayingPlan] =
    useState<string | null>(null);

  const token = getToken();
  const isPhotographer =
    user.role === "photographer";

  const usagePercent = useMemo(() => {
    if (!planStatus || planStatus.quota <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (planStatus.used / planStatus.quota) * 100
    );
  }, [planStatus]);

  useEffect(() => {
    if (!isPhotographer || !token) {
      setBillingLoading(false);
      return;
    }

    async function loadBillingStatus() {
      try {
        setBillingLoading(true);

        const res = await fetch(
          "/api/billing/status",
          {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Failed to load subscription details"
          );
        }

        setPlanStatus(data.status || null);
      } catch (error: any) {
        toast.error(
          error.message ||
            "Failed to load subscription details"
        );
      } finally {
        setBillingLoading(false);
      }
    }

    void loadBillingStatus();
  }, [isPhotographer, token]);

  useEffect(() => {
    if (!isPhotographer) {
      return;
    }

    async function loadPlans() {
      try {
        setPlansLoading(true);

        const res = await fetch(
          "/api/billing/plans",
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load plans"
          );
        }

        setPlans(data.plans || []);
      } catch (error: any) {
        toast.error(
          error.message ||
            "Failed to load plans"
        );
      } finally {
        setPlansLoading(false);
      }
    }

    void loadPlans();
  }, [isPhotographer]);

  async function saveProfile() {
    try {
      setLoading(true);

      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch(
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

      if (!res.ok) {
        throw new Error(
          "Failed to update profile"
        );
      }

      setEditMode(false);
      toast.success(
        "Profile updated successfully"
      );
    } catch (error: any) {
      toast.error(
        error.message ||
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) return "--";
    return new Date(value).toLocaleDateString();
  }

  function formatPlanLabel(planKey?: string) {
    if (!planKey) return "--";
    return planKey
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  async function ensureRazorpay() {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function refreshBillingData() {
    if (!token) return;

    const [statusRes, plansRes] =
      await Promise.all([
        fetch("/api/billing/status", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/billing/plans", {
          cache: "no-store",
        }),
      ]);

    const statusData =
      await statusRes.json();
    const plansData =
      await plansRes.json();

    if (statusRes.ok) {
      setPlanStatus(statusData.status || null);
    }

    if (plansRes.ok) {
      setPlans(plansData.plans || []);
    }
  }

  async function startPlanUpgrade(planKey: string) {
    if (!token) {
      toast.error("Please login again");
      return;
    }

    setPayingPlan(planKey);

    try {
      const ok = await ensureRazorpay();

      if (!ok) {
        throw new Error(
          "Unable to load Razorpay"
        );
      }

      const res = await fetch(
        "/api/billing/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({ planKey }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Order creation failed"
        );
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Klickshare",
        description: "Yearly Plan Upgrade",
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(
              "/api/billing/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                  Authorization:
                    `Bearer ${token}`,
                },
                body: JSON.stringify({
                  planKey,
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const verifyData =
              await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.error ||
                  "Payment verification failed"
              );
            }

            await refreshBillingData();
            setShowUpgradeModal(false);
            toast.success(
              "Plan upgraded successfully"
            );
          } catch (error: any) {
            toast.error(
              error.message ||
                "Payment verification failed"
            );
          } finally {
            setPayingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingPlan(null);
          },
        },
        theme: {
          color: "#1f6563",
        },
      });

      razorpay.open();
    } catch (error: any) {
      toast.error(
        error.message || "Payment failed"
      );
      setPayingPlan(null);
    }
  }

  return (
    <div
      className={`space-y-6 ${
        isPhotographer
          ? "max-w-4xl"
          : "max-w-4xl"
      }`}
    >
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

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-4xl rounded-[30px] border border-[#3cc2bf]/20 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#3cc2bf]/15 px-6 py-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Upgrade Plan
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Choose the plan that best fits your storage needs.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowUpgradeModal(false)
                }
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3cc2bf]/20 text-[#1f6563] transition hover:bg-[#3cc2bf]/10"
                aria-label="Close upgrade plans"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              {plansLoading ? (
                <div className="flex items-center gap-3 rounded-2xl bg-[#f8fcfc] px-4 py-5 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1f6563]" />
                  Loading available plans...
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {plans.map((plan) => {
                    const isCurrent =
                      planStatus?.planKey === plan.key;
                    const isFree =
                      plan.priceInr === 0;

                    return (
                      <div
                        key={plan.key}
                        className={`rounded-[26px] border p-5 shadow-sm transition ${
                          isCurrent
                            ? "border-[#1f6563]/30 bg-[#f5fbfb]"
                            : "border-[#3cc2bf]/20 bg-white"
                        }`}
                      >
                        <div className="text-lg font-semibold text-slate-900">
                          {plan.label}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {plan.quota} photos / year
                        </div>

                        <div className="mt-5 text-3xl font-semibold tracking-tight text-[#1f6563]">
                          {isFree
                            ? "Free"
                            : "Rs. " + plan.priceInr}
                        </div>
                        {!isFree && (
                          <div className="mt-1 text-sm text-slate-500">
                            billed yearly
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={
                            isFree ||
                            isCurrent ||
                            payingPlan === plan.key
                          }
                          onClick={() =>
                            startPlanUpgrade(plan.key)
                          }
                          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                            isCurrent
                              ? "bg-[#e6f6f5] text-[#1f6563]"
                              : isFree
                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                : "bg-[#1f6563] text-white hover:bg-[#174d4b]"
                          }`}
                        >
                          {isCurrent ? (
                            "Current Plan"
                          ) : payingPlan === plan.key ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-4 w-4" />
                              Upgrade Plan
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
              <User className="h-5 w-5" />
            </span>
            My Profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isPhotographer
              ? "Manage your profile, storage usage, and active subscription details."
              : "Manage your personal information and account details."}
          </p>
        </div>

        {!editMode ? (
          <button
            onClick={() =>
              setEditMode(true)
            }
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b]"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={saveProfile}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      <div
        className={`grid min-w-0 gap-6 ${
          isPhotographer
            ? "xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,1.15fr)]"
            : "xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,1.15fr)]"
        }`}
      >
        <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
          <div className="mb-8 flex flex-col gap-5 border-b border-[#3cc2bf]/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative">
                <img
                  src={
                    photo ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(name || "User")
                  }
                  alt="Profile"
                  className="h-24 w-24 rounded-3xl border border-[#3cc2bf]/20 object-cover shadow-sm"
                />
              </div>

              <div>
                <div className="text-xl font-semibold text-slate-900">
                  {name || "Unnamed User"}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-[#1f6563]" />
                  {isPhotographer
                    ? "Photographer account"
                    : "Viewer account"}
                </div>
              </div>
            </div>

            {editMode && (
              <button
                onClick={() =>
                  setShowCamera(true)
                }
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#3cc2bf]/20 bg-[#3cc2bf]/10 px-4 py-3 text-sm font-medium text-[#1f6563] transition hover:bg-[#3cc2bf]/15"
              >
                <Camera className="h-4 w-4" />
                Capture Photo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="h-4 w-4 text-[#1f6563]" />
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
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-slate-900 transition focus:border-[#1f6563] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20 ${
                  editMode
                    ? "border-[#3cc2bf]/25 bg-[#f8fcfc]"
                    : "border-[#3cc2bf]/15 bg-slate-50"
                }`}
              />
            </div>

            {isPhotographer && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Building2 className="h-4 w-4 text-[#1f6563]" />
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
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-slate-900 transition focus:border-[#1f6563] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20 ${
                    editMode
                      ? "border-[#3cc2bf]/25 bg-[#f8fcfc]"
                      : "border-[#3cc2bf]/15 bg-slate-50"
                  }`}
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Phone className="h-4 w-4 text-[#1f6563]" />
                Mobile Number
              </label>
              <input
                value={user.phone || ""}
                disabled
                className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/15 bg-slate-50 px-4 py-3 text-slate-700"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Shield className="h-4 w-4 text-[#1f6563]" />
                Role
              </label>
              <input
                value={user.role || ""}
                disabled
                className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/15 bg-slate-50 px-4 py-3 capitalize text-slate-700"
              />
            </div>
          </div>
        </div>

        {isPhotographer && (
          <div className="grid gap-6">
            <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                  <HardDrive className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Storage Utilization
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Track how much of your annual upload quota is currently used.
                  </p>
                </div>
              </div>

              {billingLoading ? (
                <div className="flex items-center gap-3 rounded-2xl bg-[#f8fcfc] px-4 py-5 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1f6563]" />
                  Loading storage details...
                </div>
              ) : planStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#f8fcfc] p-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Used
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {planStatus.used}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#f8fcfc] p-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Total
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {planStatus.quota}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#f8fcfc] p-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Left
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {planStatus.remaining}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                      <span>Usage progress</span>
                      <span>{usagePercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#1f6563]"
                        style={{
                          width: `${usagePercent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#f8fcfc] px-4 py-5 text-sm text-slate-600">
                  Subscription usage details are not available right now.
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Subscription Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Your current plan, billing amount, and active period.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowUpgradeModal(true)
                  }
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] sm:w-auto"
                >
                  <CreditCard className="h-4 w-4" />
                  Plans
                </button>
              </div>

              {billingLoading ? (
                <div className="flex items-center gap-3 rounded-2xl bg-[#f8fcfc] px-4 py-5 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1f6563]" />
                  Loading subscription...
                </div>
              ) : planStatus ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#f8fcfc] p-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      Active plan
                    </div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">
                      {formatPlanLabel(planStatus.planKey)}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#3cc2bf]/15 p-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Price
                      </div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">
                        {planStatus.priceInr === 0
                          ? "Free"
                          : "Rs. " + planStatus.priceInr + " / year"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#3cc2bf]/15 p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        <CalendarDays className="h-4 w-4 text-[#1f6563]" />
                        Active period
                      </div>
                      <div className="mt-2 text-sm font-medium text-slate-900">
                        {formatDate(planStatus.planStart)}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        to {formatDate(planStatus.planEnd)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#f8fcfc] px-4 py-5 text-sm text-slate-600">
                  Subscription details are not available right now.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
