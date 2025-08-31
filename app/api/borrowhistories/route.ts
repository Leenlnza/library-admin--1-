import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { BorrowHistory } from "@/lib/models";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test"); // ใช้ test แทน library
    const histories = await db
      .collection<BorrowHistory>("borrowhistories")
      .find({})
      .toArray();
    return NextResponse.json(histories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch borrow histories" }, { status: 500 });
  }
}
