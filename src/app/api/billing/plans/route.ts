import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getPlanCatalog } from "@/lib/plans";

export async function GET() {
  await connectDB();
  const plans = await getPlanCatalog();
  return NextResponse.json({ plans });
}
