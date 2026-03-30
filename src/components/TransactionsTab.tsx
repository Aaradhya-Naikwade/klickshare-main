"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  Receipt,
} from "lucide-react";

type Plan = {
  key: string;
  label: string;
  priceInr: number;
  quota: number;
};

type PlanStatus = {
  planKey: string;
  planStart: string;
  planEnd: string;
  quota: number;
  used: number;
  remaining: number;
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
  const [status, setStatus] =
    useState<PlanStatus | null>(null);
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

      const [statusRes, txRes] =
        await Promise.all([
          fetch("/api/billing/status", {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/billing/transactions", {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const statusData =
        await statusRes.json();
      const txData = await txRes.json();

      if (!statusRes.ok) {
        throw new Error(
          statusData.error ||
          "Failed to load plan status"
        );
      }

      if (!txRes.ok) {
        throw new Error(
          txData.error ||
          "Failed to load transactions"
        );
      }

      setStatus(statusData.status);
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
    loadAll();
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
      loadAll(false);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [token, payments]);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString();
  }

  function planLabel(key: string) {
    return (
      plans.find((p) => p.key === key)
        ?.label || key
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
          color: "#0f766e",
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
        currency: p.orderCurrency || p.currency || "INR",
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
          color: "#0f766e",
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
        <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-3" />
          <div className="font-medium text-[#111827]">
            Loading transactions...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Transactions
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Manage your yearly plan and payment history
          </p>
        </div>

        <button
          onClick={() => {
            void loadAll();
          }}
          className="
            bg-[#e0f2f1]
            hover:bg-[#ccebea]
            text-[#0f766e]
            px-4 py-2
            rounded-lg
            flex items-center gap-2
            text-sm
            border border-[#b2dfdb]
          "
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
  
      {/* Plan Status */}
      {status && (
        <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-[#0f766e]" />
            <div>
              <div className="text-lg font-semibold text-[#111827]">
                Current Plan: {planLabel(status.planKey)}
              </div>
              <div className="text-sm text-[#6b7280] flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {formatDate(status.planStart)} -{" "}
                {formatDate(status.planEnd)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[#6b7280]">
              <span>
                Used {status.used} of {status.quota}
              </span>
              <span>{status.remaining} left</span>
            </div>
            <div className="h-3 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0f766e]"
                style={{
                  width: `${Math.min(
                    100,
                    (status.used / status.quota) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isFree = plan.priceInr === 0;
          const isCurrent =
            status?.planKey === plan.key;

          return (
            <div
              key={plan.key}
              className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm"
            >
              <div className="text-lg font-semibold text-[#111827]">
                {plan.label}
              </div>
              <div className="text-sm text-[#6b7280] mt-1">
                {plan.quota} photos / year
              </div>
              <div className="text-2xl font-bold text-[#0f766e] mt-4">
                {isFree
                  ? "Free"
                  : `₹${plan.priceInr}`}
              </div>

              <button
                disabled={isFree || isCurrent || paying === plan.key}
                onClick={() =>
                  startPayment(plan.key)
                }
                className={`
                  mt-4 w-full py-2 rounded-lg text-sm font-medium
                  ${isCurrent
                    ? "bg-[#e0f2f1] text-[#0f766e] cursor-default"
                    : isFree
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#0f766e] hover:bg-[#0b5e58] text-white"
                  }
                `}
              >
                {isCurrent
                  ? "Active Plan"
                  : isFree
                    ? "Included"
                    : paying === plan.key
                      ? "Processing..."
                      : "Buy Yearly"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Transactions */}
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm">
        <div className="text-lg font-semibold text-[#111827] mb-4">
          Payment History
        </div>

        {payments.length === 0 ? (
          <div className="text-sm text-[#6b7280]">
            No transactions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-3 border border-[#e5e7eb] rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-[#111827]">
                    {planLabel(p.planKey)}
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {formatDate(p.createdAt)} • {p.razorpayOrderId}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-[#111827]">
                    ₹{p.amount}
                  </div>
                  {p.status === "paid" ? (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid
                    </div>
                  ) : p.status === "failed" ? (
                    <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                      <XCircle className="w-4 h-4" />
                      Failed
                    </div>
                  ) : p.status === "canceled" ? (
                    <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                      <XCircle className="w-4 h-4" />
                      Canceled
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Pending
                      </div>
                      <button
                        onClick={() => retryPayment(p)}
                        disabled={paying === p._id}
                        className="text-xs px-3 py-1 rounded-lg border border-[#0f766e] text-[#0f766e] hover:bg-[#e0f2f1]"
                      >
                        {paying === p._id
                          ? "Processing..."
                          : "Retry"}
                      </button>
                      <button
                        onClick={() => cancelPayment(p)}
                        className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
