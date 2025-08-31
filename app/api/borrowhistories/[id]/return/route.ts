import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("test"); // ใช้ฐาน test
    const loanId = params.id;

    // หา borrow history
    const loan = await db
      .collection("borrowhistories")
      .findOne({ _id: new ObjectId(loanId) });
    if (!loan) {
      return NextResponse.json({ error: "Borrow history not found" }, { status: 404 });
    }

    // อัปเดต borrow history
    await db.collection("borrowhistories").updateOne(
      { _id: new ObjectId(loanId) },
      {
        $set: {
          status: "returned",
          returnedDate: new Date(),
        },
      }
    );

    // อัปเดตหนังสือให้ available = true และล้างข้อมูลผู้ยืม
    await db.collection("books").updateOne(
      { title: loan.bookTitle },
      {
        $set: {
          available: true,
          borrowedBy: "",
          borrowerPhone: "",
          borrowedDate: "",
          dueDate: "",
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to return book" }, { status: 500 });
  }
}
