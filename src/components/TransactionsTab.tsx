"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

import {
  CheckCircle2,
  XCircle,
  Loader2,
  WalletCards,
  CreditCard,
  ArrowUpRight,
  X,
} from "lucide-react";

type Plan = {
  key: string;
  label: string;
  priceInr: number;
  quota: number;
};

type Payment = {
  _id: string;
  planKey: string;
  amount: number;
  currency: string;
  status:
    | "pending"
    | "paid"
    | "failed"
    | "canceled";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  orderAmount?: number;
  orderCurrency?: string;
  canceledAt?: string | null;
  createdAt: string;
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function TransactionsTab() {
  const [plans, setPlans] =
    useState<Plan[]>([]);
  const [currentPlanKey, setCurrentPlanKey] =
    useState<string | null>(null);
  const [payments, setPayments] =
    useState<Payment[]>([]);
  const [razorpayKeyId, setRazorpayKeyId] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [paying, setPaying] =
    useState<string | null>(null);
  const [showPlansModal, setShowPlansModal] =
    useState(false);

  const token = getToken();

  async function loadAll(showLoader = true) {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError("");

      const plansRes = await fetch(
        "/api/billing/plans",
        {
          cache: "no-store",
        }
      );
      const plansData =
        await plansRes.json();

      if (!plansRes.ok) {
        throw new Error(
          "Failed to load plans"
        );
      }

      setPlans(plansData.plans || []);

      if (!token) {
        throw new Error("Please login");
      }

      const statusRes = await fetch(
        "/api/billing/status",
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const statusData =
        await statusRes.json();

      if (!statusRes.ok) {
        throw new Error(
          statusData.error ||
            "Failed to load plan status"
        );
      }

      setCurrentPlanKey(
        statusData.status?.planKey || null
      );

      const txRes = await fetch(
        "/api/billing/transactions",
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const txData = await txRes.json();

      if (!txRes.ok) {
        throw new Error(
          txData.error ||
            "Failed to load transactions"
        );
      }

      setPayments(txData.payments || []);
      setRazorpayKeyId(txData.keyId || "");
    } catch (err: any) {
      setError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const hasPendingPayment = payments.some(
      (payment) => payment.status === "pending"
    );

    const intervalMs = hasPendingPayment
      ? 3000
      : 15000;

    const interval = window.setInterval(() => {
      void loadAll(false);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [token, payments]);

  function formatDateTime(d: string) {
    return new Date(d).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function formatCurrency(amount: number) {
    return `Rs. ${amount}`;
  }

  function planLabel(key: string) {
    return (
      plans.find((p) => p.key === key)
        ?.label || key
    );
  }

  function formatStatusLabel(
    paymentStatus: Payment["status"]
  ) {
    return paymentStatus.charAt(0).toUpperCase() +
      paymentStatus.slice(1);
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

  async function startPayment(planKey: string) {
    if (!token) {
      setError("Please login");
      return;
    }

    setPaying(planKey);
    setError("");

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
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Klickshare",
        description: "Yearly Plan",
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

            setShowPlansModal(false);
            await loadAll();
          } catch (err: any) {
            setError(
              err.message ||
                "Payment verification failed"
            );
          } finally {
            setPaying(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(null);
          },
        },
        theme: {
          color: "#1f6563",
        },
      });

      rzp.open();
    } catch (err: any) {
      setError(
        err.message || "Payment failed"
      );
      setPaying(null);
    } finally {
      if (!window.Razorpay) {
        setPaying(null);
      }
    }
  }

  async function retryPayment(p: Payment) {
    if (!token) {
      setError("Please login");
      return;
    }

    if (!razorpayKeyId) {
      setError("Razorpay key missing");
      return;
    }

    setPaying(p._id);
    setError("");

    try {
      const ok = await ensureRazorpay();
      if (!ok) {
        throw new Error(
          "Unable to load Razorpay"
        );
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount:
          p.orderAmount && p.orderAmount > 0
            ? p.orderAmount
            : p.amount * 100,
        currency:
          p.orderCurrency || p.currency || "INR",
        name: "Klickshare",
        description: "Retry Payment",
        order_id: p.razorpayOrderId,
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
                  planKey: p.planKey,
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

            await loadAll();
          } catch (err: any) {
            setError(
              err.message ||
                "Payment verification failed"
            );
          } finally {
            setPaying(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(null);
          },
        },
        theme: {
          color: "#1f6563",
        },
      });

      rzp.open();
    } catch (err: any) {
      setError(
        err.message || "Payment failed"
      );
      setPaying(null);
    } finally {
      if (!window.Razorpay) {
        setPaying(null);
      }
    }
  }

  async function cancelPayment(p: Payment) {
    if (!token) return;
    const confirmed = window.confirm(
      "Cancel this pending payment?"
    );
    if (!confirmed) return;

    const res = await fetch(
      "/api/billing/cancel",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: p.razorpayOrderId,
        }),
      }
    );

    if (!res.ok) return;
    await loadAll();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="flex flex-col items-center rounded-xl border border-[#b2dfdb] bg-white p-8 shadow-sm">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#1f6563]" />
          <div className="font-medium text-[#111827]">
            Loading transactions...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending"
  ).length;

  return (
    <div className="max-w-4xl space-y-6">
      {showPlansModal && (
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
                  setShowPlansModal(false)
                }
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3cc2bf]/20 text-[#1f6563] transition hover:bg-[#3cc2bf]/10"
                aria-label="Close upgrade plans"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => {
                  const isCurrent =
                    currentPlanKey === plan.key;
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
                          paying === plan.key
                        }
                        onClick={() =>
                          startPayment(plan.key)
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
                        ) : paying === plan.key ? (
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
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                <WalletCards className="h-5 w-5" />
              </span>
              Transactions
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review your billing activity and manage any pending payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowPlansModal(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b]"
          >
            <CreditCard className="h-4 w-4" />
            Plans
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-[#3cc2bf]/15 pt-5">
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Records
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {payments.length}
            </div>
          </div>

          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Pending
            </div>
            <div className="mt-2 text-lg font-semibold text-[#1f6563]">
              {pendingPayments}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 border-b border-[#3cc2bf]/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Payment History
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Track completed, pending, failed, and canceled billing attempts.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3 text-sm font-medium text-slate-600">
            {payments.length} record{payments.length === 1 ? "" : "s"}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#3cc2bf]/25 bg-[#f8fcfc] px-5 py-12 text-center">
            <div className="text-lg font-semibold text-slate-900">
              No transactions yet
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Your payment activity will appear here once you purchase or renew a plan.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p._id}
                className="rounded-[24px] border border-[#3cc2bf]/15 bg-[#fcfefe] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">
                        {planLabel(p.planKey)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          p.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "failed"
                              ? "bg-red-50 text-red-600"
                              : p.status === "canceled"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status === "paid" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : p.status === "pending" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {formatStatusLabel(p.status)}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          Date
                        </div>
                        <div className="mt-1 text-slate-600">
                          {formatDateTime(p.createdAt)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          Order ID
                        </div>
                        <div className="mt-1 truncate text-slate-600">
                          {p.razorpayOrderId}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="text-2xl font-semibold text-slate-900">
                      {formatCurrency(p.amount)}
                    </div>

                    {p.status === "pending" && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() => retryPayment(p)}
                          disabled={paying === p._id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3cc2bf]/20 bg-[#3cc2bf]/10 px-4 py-2.5 text-sm font-medium text-[#1f6563] transition hover:bg-[#3cc2bf]/15 disabled:opacity-50"
                        >
                          {paying === p._id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Retry"
                          )}
                        </button>
                        <button
                          onClick={() => cancelPayment(p)}
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
