"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const hasInitializedHistory = useRef(false);
  const isHandlingPopState = useRef(false);
  const previousStep = useRef<
    "phone" | "otp" | "role" | "signup"
  >("phone");

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentState = window.history.state || {};

    window.history.replaceState(
      {
        ...currentState,
        __authFlow: true,
        step: "phone",
      },
      ""
    );

    const handlePopState = (event: PopStateEvent) => {
      const nextStep =
        event.state?.__authFlow &&
        event.state?.step;

      if (!nextStep) return;

      isHandlingPopState.current = true;
      setStep(nextStep);
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    hasInitializedHistory.current = true;

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !hasInitializedHistory.current
    ) {
      return;
    }

    if (isHandlingPopState.current) {
      isHandlingPopState.current = false;
      previousStep.current = step;
      return;
    }

    if (previousStep.current === step) return;

    window.history.pushState(
      {
        ...(window.history.state || {}),
        __authFlow: true,
        step,
      },
      ""
    );

    previousStep.current = step;
  }, [step]);

  // SEND OTP (PHONE STEP)
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

      if (data.exists) {
        toast.success("OTP sent successfully");
        setStep("otp");
      } else {
        toast.success(
          "OTP sent successfully. Continue signup."
        );
        setStep("role");
      }
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
        
      // existing user -> login
      if (data.exists) {
        setToken(data.token);

        toast.success("Login successful");

        router.replace("/dashboard");
        return;
      }

      toast.success("Account not found. Continue signup.");
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
            otp,
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
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#f4fbfb] to-[#dff5f4] px-4 py-4">

      {/* CARD */}
      <div
        className={`w-full rounded-2xl border border-[#3cc2bf]/20 bg-white/95 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.28)] backdrop-blur ${
          step === "role" || step === "signup"
            ? "max-w-5xl overflow-hidden p-0"
            : "max-w-md p-6"
        }`}
      > 

        {/* HEADER */}
        {step !== "role" && step !== "signup" && (
        <div className="mb-6">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Welcome to Klickshare
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Login or create your account
          </p>

        </div>
        )}

        {/* PHONE STEP */}
        {step === "phone" && (
          <div className="space-y-4">

            {/* INPUT */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Mobile Number
              </label>

              <div className="relative mt-1">

                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  className="w-full rounded-xl border border-[#3cc2bf]/25 bg-[#f7fbfb] py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-[#1f6563] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6563] py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:opacity-50"
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
              <label className="text-sm font-medium text-slate-700">
                Enter OTP
              </label>

              <div className="relative mt-1">

                <ShieldCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full rounded-xl border border-[#3cc2bf]/25 bg-[#f7fbfb] py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-[#1f6563] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6563] py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="grid md:grid-cols-[1.15fr_0.85fr]">
            <div className="relative hidden min-h-[min(70vh,520px)] bg-[#e8f8f7] md:block">
              <Image
                src="/auth/role-select-img.avif"
                alt="Role selection"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  Choose how you want to use Klickshare
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                  Pick the role that fits your workflow. You can continue signup right after.
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Select your role
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Continue with the experience that matches what you need.
                </p>
              </div>

              <div className="grid gap-4">

              {/* VIEWER */}
              <button
                onClick={() => {
                  setRole("viewer");
                  setStep("signup");
                }}
                className="rounded-2xl border border-[#3cc2bf]/25 bg-white p-5 text-left transition hover:border-[#1f6563] hover:bg-[#f3fbfb]"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#3cc2bf]/15">
                  <Eye className="text-[#1f6563]" />
                </div>

                <div className="font-medium text-slate-900">
                  Viewer
                </div>

                <div className="mt-1 text-sm leading-5 text-slate-600">
                  Browse and view photos
                </div>

              </button>

              {/* PHOTOGRAPHER */}
              <button
                onClick={() => {
                  setRole("photographer");
                  setStep("signup");
                }}
                className="rounded-2xl border border-[#3cc2bf]/25 bg-white p-5 text-left transition hover:border-[#1f6563] hover:bg-[#f3fbfb]"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#3cc2bf]/15">
                  <Camera className="text-[#1f6563]" />
                </div>

                <div className="font-medium text-slate-900">
                  Photographer
                </div>

                <div className="mt-1 text-sm leading-5 text-slate-600">
                  Upload and manage photos
                </div>

              </button>

            </div>
            </div>
          </div>
        )}

        {/* SIGNUP STEP */}
        {step === "signup" && (
          <div className="grid md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative hidden min-h-[min(72vh,560px)] bg-[#e8f8f7] md:block">
              <Image
                src={
                  role === "photographer"
                    ? "/auth/photographer-form-img.avif"
                    : "/auth/viewer-form-img.avif"
                }
                alt={
                  role === "photographer"
                    ? "Photographer signup"
                    : "Viewer signup"
                }
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  {role === "photographer"
                    ? "Set up your photographer profile"
                    : "Finish setting up your viewer account"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                  {role === "photographer"
                    ? "Add your details to start uploading and managing your photo collections."
                    : "Complete your details to start browsing and viewing your shared moments."}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Complete signup
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add your details to finish creating your account.
                </p>
              </div>

              <div className="space-y-4">
                {/* NAME */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Name
                  </label>

                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      className="w-full rounded-xl border border-[#3cc2bf]/25 bg-[#f7fbfb] py-3 pl-10 pr-4 text-slate-900 transition focus:border-[#1f6563] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
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
                    <label className="text-sm font-medium text-slate-700">
                      Company Name
                    </label>

                    <div className="relative mt-1">
                      <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        className="w-full rounded-xl border border-[#3cc2bf]/25 bg-[#f7fbfb] py-3 pl-10 pr-4 text-slate-900 transition focus:border-[#1f6563] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
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
                  <label className="text-sm font-medium text-slate-700">
                    Mobile Number
                  </label>

                  <input
                    value={phone}
                    disabled
                    className="w-full rounded-xl border border-[#3cc2bf]/20 bg-[#f1f8f8] px-4 py-3 text-slate-700"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Role
                  </label>

                  <input
                    value={role}
                    disabled
                    className="w-full rounded-xl border border-[#3cc2bf]/20 bg-[#f1f8f8] px-4 py-3 capitalize text-slate-700"
                  />
                </div>
                
                {/* OTP */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    OTP
                  </label>

                  <div className="relative mt-1">
                    <ShieldCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="w-full rounded-xl border border-[#3cc2bf]/25 bg-[#f7fbfb] py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-[#1f6563] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  onClick={completeSignup}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6563] py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
