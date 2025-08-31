import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Book } from "@/lib/models"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("test")

    // ดึงข้อมูลทั้งหมด
    const books = await db.collection<Book>("books").find({}).toArray()

    return NextResponse.json(books)
  } catch (error) {
    console.error("GET /api/books error:", error)
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("test")

    const body = await request.json()

    // ตรวจสอบ field ที่จำเป็น
    if (!body.title || !body.author || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newBook: Omit<Book, "_id"> = {
      title: body.title,
      author: body.author,
      category: body.category,
      available: true,
      coverImage: body.coverImage || "",
      createdAt: new Date(),
    }

    const result = await db.collection<Book>("books").insertOne(newBook as Book)
    const insertedBook = await db.collection<Book>("books").findOne({ _id: result.insertedId })

    return NextResponse.json(insertedBook)
  } catch (error) {
    console.error("POST /api/books error:", error)
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}
