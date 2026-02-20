"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";
import { toast } from "sonner";
import {
  Phone,
  ShieldCheck,
  User,
  Building2,
  Camera,
  Eye,
  Loader2,
} from "lucide-react";

export default function AuthForm() {
  const router = useRouter();

  const [step, setStep] = useState<
    "phone" | "otp" | "role" | "signup"
  >("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [role, setRole] = useState<
    "" | "viewer" | "photographer"
  >("");

  const [name, setName] = useState("");
  const [companyName, setCompanyName] =
    useState("");

  const [loading, setLoading] = useState(false);

  // SEND OTP
  async function sendOtp() {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.gatewayResponse
            ? `${data.error}: ${data.gatewayResponse}`
            : data.error || "Failed to send OTP"
        );

      toast.success("OTP sent successfully");

      setStep("otp");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // VERIFY OTP
  async function verifyOtp() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone, otp }),
        }
      );

      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.error || "Invalid OTP"
        );

      // existing user → login
      if (data.exists) {
        setToken(data.token);

        toast.success("Login successful");

        router.replace("/dashboard");
        return;
      }

      toast.success("OTP verified");

      // new user → select role
      setStep("role");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // COMPLETE SIGNUP
  async function completeSignup() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/auth/complete-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            role,
            name,
            companyName,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.error || "Signup failed"
        );

      setToken(data.token);

      toast.success("Account created successfully");

      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e0f2f1] px-4">

      {/* CARD */}
      <div className="w-full max-w-md bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8">

        {/* HEADER */}
        <div className="mb-6">

          <h2 className="text-2xl font-bold text-[#0f766e]">
            Welcome to Klickshare
          </h2>

          <p className="text-[#6b7280] mt-1">
            Login or create your account
          </p>

        </div>

        {/* PHONE STEP */}
        {step === "phone" && (
          <div className="space-y-4">

            {/* INPUT */}
            <div>
              <label className="text-sm font-medium text-[#111827]">
                Mobile Number
              </label>

              <div className="relative mt-1">

                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f766e] w-5 h-5" />

                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  className="w-full bg-white border border-[#b2dfdb] rounded-lg pl-10 pr-4 py-3 text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] transition"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />

              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-[#0f766e] hover:bg-[#0b5e58] text-white font-medium py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Send OTP
                </>
              )}
            </button>

          </div>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <div className="space-y-4">

            <div>
              <label className="text-sm font-medium text-[#111827]">
                Enter OTP
              </label>

              <div className="relative mt-1">

                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f766e] w-5 h-5" />

                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full bg-white border border-[#b2dfdb] rounded-lg pl-10 pr-4 py-3 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                />

              </div>
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-[#0f766e] hover:bg-[#0b5e58] text-white font-medium py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Verify OTP
                </>
              )}
            </button>

          </div>
        )}

        {/* ROLE STEP */}
        {step === "role" && (
          <div>

            <label className="text-sm font-medium text-[#111827]">
              Select your role
            </label>

            <div className="grid grid-cols-2 gap-4 mt-3">

              {/* VIEWER */}
              <button
                onClick={() => {
                  setRole("viewer");
                  setStep("signup");
                }}
                className="border border-[#b2dfdb] rounded-xl p-4 hover:border-[#0f766e] hover:bg-[#e0f2f1] transition text-left"
              >
                <Eye className="text-[#0f766e] mb-2" />

                <div className="text-[#111827] font-medium">
                  Viewer
                </div>

                <div className="text-sm text-[#6b7280]">
                  Browse and view photos
                </div>

              </button>

              {/* PHOTOGRAPHER */}
              <button
                onClick={() => {
                  setRole("photographer");
                  setStep("signup");
                }}
                className="border border-[#b2dfdb] rounded-xl p-4 hover:border-[#0f766e] hover:bg-[#e0f2f1] transition text-left"
              >
                <Camera className="text-[#0f766e] mb-2" />

                <div className="text-[#111827] font-medium">
                  Photographer
                </div>

                <div className="text-sm text-[#6b7280]">
                  Upload and manage photos
                </div>

              </button>

            </div>

          </div>
        )}

        {/* SIGNUP STEP */}
        {step === "signup" && (
          <div className="space-y-4">

            {/* NAME */}
            <div>
              <label className="text-sm font-medium text-[#111827]">
                Name
              </label>

              <div className="relative mt-1">

                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f766e] w-5 h-5" />

                <input
                  className="w-full bg-white border border-[#b2dfdb] rounded-lg pl-10 pr-4 py-3 text-[#111827] focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>
            </div>

            {/* COMPANY */}
            {role === "photographer" && (
              <div>

                <label className="text-sm font-medium text-[#111827]">
                  Company Name
                </label>

                <div className="relative mt-1">

                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f766e] w-5 h-5" />

                  <input
                    className="w-full bg-white border border-[#b2dfdb] rounded-lg pl-10 pr-4 py-3 text-[#111827] focus:ring-2 focus:ring-[#0f766e]"
                    value={companyName}
                    onChange={(e) =>
                      setCompanyName(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>
            )}

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium text-[#111827]">
                Mobile Number
              </label>

              <input
                value={phone}
                disabled
                className="w-full border border-[#b2dfdb] bg-gray-50 rounded-lg p-3 text-[#111827]"
              />
            </div>

            {/* ROLE */}
            <div>
              <label className="text-sm font-medium text-[#111827]">
                Role
              </label>

              <input
                value={role}
                disabled
                className="w-full border border-[#b2dfdb] bg-gray-50 rounded-lg p-3 text-[#111827] capitalize"
              />
            </div>

            {/* BUTTON */}
            <button
              onClick={completeSignup}
              disabled={loading}
              className="w-full bg-[#0f766e] hover:bg-[#0b5e58] text-white font-medium py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Creating account...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Complete Signup
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
