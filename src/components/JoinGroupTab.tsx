"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import {
  Users,
  KeyRound,
  Loader2,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function JoinGroupTab() {
  const [inviteCode, setInviteCode] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [status, setStatus] =
    useState("");

  function handleInviteCodeChange(
    value: string
  ) {
    const sanitizedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);

    setInviteCode(sanitizedValue);
  }

  async function handleJoin() {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch(
        "/api/groups/join",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            inviteCode,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to join group"
        );
      }

      setStatus(data.status);

      if (data.status === "approved") {
        toast.success(
          "Successfully joined group"
        );
      } else {
        toast.success(
          "Join request sent for approval"
        );
      }

      setInviteCode("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
            <Users className="h-5 w-5" />
          </span>
          Join New Group
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter the 8-character invite code shared by the group admin.
        </p>
      </div>

      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
        {status === "approved" && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#3cc2bf]/20 bg-[#ecf9f8] p-4 text-[#1f6563]">
            <CheckCircle className="h-5 w-5" />
            Successfully joined the group
          </div>
        )}

        {status === "pending" && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
            <Clock className="h-5 w-5" />
            Request sent. Waiting for approval
          </div>
        )}

        <div className="mb-6">
          <label className="text-sm font-medium text-slate-700">
            Invite Code
          </label>

          <div className="relative mt-2">
            <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f6563]" />

            <input
              value={inviteCode}
              onChange={(e) =>
                handleInviteCodeChange(
                  e.target.value
                )
              }
              placeholder="Ex: A1B2C3D4"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={8}
              className="
                w-full
                rounded-2xl
                border border-[#3cc2bf]/25
                bg-[#f8fcfc]
                py-4
                pl-12
                pr-4
                text-base
                font-medium
                tracking-[0.3em]
                text-slate-900
                uppercase
                transition
                placeholder:tracking-[0.18em]
                placeholder:text-slate-400
                focus:border-[#1f6563]
                focus:bg-white
                focus:outline-none
                focus:ring-4
                focus:ring-[#3cc2bf]/20
              "
            />
          </div>

          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
            Only letters and numbers are allowed.
          </p>
        </div>

        <button
          onClick={handleJoin}
          disabled={loading || !inviteCode}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[#1f6563]
            py-3.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#174d4b]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Joining group...
            </>
          ) : (
            <>
              <Users className="h-5 w-5" />
              Join Group
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="mt-6 rounded-2xl border border-[#3cc2bf]/15 bg-[#f8fcfc] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-[#1f6563]" />
            <p className="text-sm leading-6 text-slate-600">
              Private groups require an invite code. Some groups approve instantly, while others may send your request for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
