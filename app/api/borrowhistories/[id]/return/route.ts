import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const loanId = params.id;

    const loan = await db.collection("borrowhistories").findOne({ _id: new ObjectId(loanId) });
    if (!loan) {
      return NextResponse.json({ error: "Borrow history not found" }, { status: 404 });
    }

    // อัปเดต status และวันที่คืน
    await db.collection("borrowhistories").updateOne(
      { _id: new ObjectId(loanId) },
      {
        $set: {
          status: "returned",
          returnedDate: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to return book" }, { status: 500 });
  }
}
