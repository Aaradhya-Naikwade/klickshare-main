"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Plan = {
  key: string;
  label: string;
  priceInr: number;
  quota: number;
};

type PaymentEventLog = {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  event: string;
  signatureValid: boolean;
  receivedAt: string;
  payload: any;
  headers: any;
};

type PaymentItem = {
  _id: string;
  userId: string;
  user: { _id: string; name: string; phone: string; role: string } | null;
  planKey: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: any[];
};

const ADMIN_TOKEN_KEY = "admin_token";

function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function adminFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(
    null
  );
  const [reconciling, setReconciling] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "plans" | "payments" | "logs"
  >("plans");
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [logs, setLogs] = useState<PaymentEventLog[]>(
    []
  );
  const [payments, setPayments] = useState<PaymentItem[]>(
    []
  );
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    "all" | "pending" | "paid" | "failed"
  >("all");

  async function loadPlans() {
    setLoading(true);
    const res = await adminFetch("/api/admin/plans");
    if (res.status === 401) {
      clearAdminToken();
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    setPlans(data.plans || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPlans().catch(() => {
      toast.error("Failed to load plans");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeTab === "payments") {
      fetchPayments();
    }
  }, [activeTab, paymentStatusFilter]);

  async function savePlan(plan: Plan) {
    try {
      setSavingKey(plan.key);
      const res = await adminFetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: plan.key,
          priceInr: plan.priceInr,
          quota: plan.quota,
          label: plan.label,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      setPlans(data.plans || []);
      toast.success("Plan updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingKey(null);
    }
  }

  async function reconcilePayments() {
    try {
      setReconciling(true);
      const res = await adminFetch(
        "/api/admin/payments/reconcile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days: 7 }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Reconcile failed");
      }
      toast.success(
        `Reconciled ${data.reconciled} of ${data.checked} payments`
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReconciling(false);
    }
  }

  async function fetchLogs() {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams();
      if (orderId.trim())
        params.set("orderId", orderId.trim());
      if (paymentId.trim())
        params.set(
          "paymentId",
          paymentId.trim()
        );

      if (
        !params.get("orderId") &&
        !params.get("paymentId")
      ) {
        toast.error(
          "Enter orderId or paymentId"
        );
        setLogsLoading(false);
        return;
      }

      const res = await adminFetch(
        `/api/admin/payments/logs?${params.toString()}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load logs"
        );
      }
      setLogs(data.logs || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLogsLoading(false);
    }
  }

  async function fetchPayments() {
    try {
      setPaymentsLoading(true);
      const params = new URLSearchParams();
      if (paymentStatusFilter !== "all") {
        params.set("status", paymentStatusFilter);
      }
      params.set("limit", "100");

      const res = await adminFetch(
        `/api/admin/payments?${params.toString()}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load payments"
        );
      }
      setPayments(data.payments || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPaymentsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage subscription pricing and quotas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reconcilePayments}
              disabled={reconciling}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-50"
            >
              {reconciling ? "Reconciling..." : "Reconcile Payments"}
            </button>
            <button
              onClick={() => {
                clearAdminToken();
                router.replace("/admin/login");
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 pt-4 flex items-center gap-2">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-2 rounded-lg border text-sm ${
                activeTab === "plans"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Plans
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 rounded-lg border text-sm ${
                activeTab === "payments"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 rounded-lg border text-sm ${
                activeTab === "logs"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Payment Logs
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            {activeTab === "plans" ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  Subscription Plans
                </h2>
                <p className="text-sm text-gray-500">
                  Changes apply to new purchases only. Existing
                  plans keep their original price.
                </p>
              </>
            ) : activeTab === "payments" ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payments
                </h2>
                <p className="text-sm text-gray-500">
                  All payments with status and order details.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Webhook Logs
                </h2>
                <p className="text-sm text-gray-500">
                  Search by Razorpay order or payment ID.
                </p>
              </>
            )}
          </div>

          {activeTab === "plans" ? (
            loading ? (
              <div className="p-6 text-gray-500">
                Loading plans...
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.key}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs uppercase text-gray-500">
                          Label
                        </label>
                        <input
                          value={plan.label}
                          onChange={(e) =>
                            setPlans((prev) =>
                              prev.map((p) =>
                                p.key === plan.key
                                  ? {
                                      ...p,
                                      label: e.target.value,
                                    }
                                  : p
                              )
                            )
                          }
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div className="w-full md:w-40">
                        <label className="text-xs uppercase text-gray-500">
                          Price (INR)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={plan.priceInr}
                          onChange={(e) =>
                            setPlans((prev) =>
                              prev.map((p) =>
                                p.key === plan.key
                                  ? {
                                      ...p,
                                      priceInr: Number(
                                        e.target.value
                                      ),
                                    }
                                  : p
                              )
                            )
                          }
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div className="w-full md:w-40">
                        <label className="text-xs uppercase text-gray-500">
                          Quota
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={plan.quota}
                          onChange={(e) =>
                            setPlans((prev) =>
                              prev.map((p) =>
                                p.key === plan.key
                                  ? {
                                      ...p,
                                      quota: Number(
                                        e.target.value
                                      ),
                                    }
                                  : p
                              )
                            )
                          }
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div className="w-full md:w-36">
                        <label className="text-xs uppercase text-gray-500">
                          Key
                        </label>
                        <div className="mt-1 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 bg-gray-50">
                          {plan.key}
                        </div>
                      </div>

                      <div className="w-full md:w-28">
                        <button
                          onClick={() => savePlan(plan)}
                          disabled={savingKey === plan.key}
                          className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                          {savingKey === plan.key
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "payments" ? (
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) =>
                    setPaymentStatusFilter(
                      e.target.value as any
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
                <button
                  onClick={fetchPayments}
                  disabled={paymentsLoading}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {paymentsLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              <div className="mt-6 overflow-auto">
                {payments.length === 0 ? (
                  <div className="text-gray-500">
                    No payments found.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2">Status</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Plan</th>
                        <th className="py-2">User</th>
                        <th className="py-2">Order ID</th>
                        <th className="py-2">Payment ID</th>
                        <th className="py-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr
                          key={p._id}
                          className="border-b"
                        >
                          <td className="py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                p.status === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : p.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2">
                            {p.amount} {p.currency}
                          </td>
                          <td className="py-2">{p.planKey}</td>
                          <td className="py-2">
                            {p.user
                              ? `${p.user.name} (${p.user.phone})`
                              : p.userId}
                          </td>
                          <td className="py-2">{p.razorpayOrderId}</td>
                          <td className="py-2">{p.razorpayPaymentId || "-"}</td>
                          <td className="py-2">
                            {new Date(p.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={orderId}
                  onChange={(e) =>
                    setOrderId(e.target.value)
                  }
                  placeholder="Razorpay Order ID (order_...)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  value={paymentId}
                  onChange={(e) =>
                    setPaymentId(e.target.value)
                  }
                  placeholder="Razorpay Payment ID (pay_...)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={fetchLogs}
                  disabled={logsLoading}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {logsLoading ? "Loading..." : "Search"}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    No logs found.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log._id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">
                            {log.event}
                          </span>
                          {" • "}
                          {log.razorpayOrderId}
                          {log.razorpayPaymentId
                            ? ` • ${log.razorpayPaymentId}`
                            : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(
                            log.receivedAt
                          ).toLocaleString()}
                          {" • "}
                          {log.signatureValid
                            ? "Signature OK"
                            : "Signature FAIL"}
                        </div>
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-gray-700">
                          View payload
                        </summary>
                        <pre className="mt-2 text-xs bg-white border border-gray-200 rounded-lg p-3 overflow-auto">
                          {JSON.stringify(
                            log.payload,
                            null,
                            2
                          )}
                        </pre>
                      </details>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-700">
                          View headers
                        </summary>
                        <pre className="mt-2 text-xs bg-white border border-gray-200 rounded-lg p-3 overflow-auto">
                          {JSON.stringify(
                            log.headers,
                            null,
                            2
                          )}
                        </pre>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
