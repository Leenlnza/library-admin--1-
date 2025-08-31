import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Member } from "@/lib/models"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("test") // เปลี่ยนเป็นฐาน test
    const members = await db.collection<Member>("members").find({}).toArray()

    return NextResponse.json(members)
  } catch (error) {
    console.error("GET /api/members error:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("test") // เปลี่ยนเป็นฐาน test
    const body = await request.json()

    // ตรวจสอบ field จำเป็น
    if (!body.name || !body.email || !body.phone || !body.password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newMember: Member = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      joinDate: new Date(),
    }

    const result = await db.collection<Member>("members").insertOne(newMember)

    return NextResponse.json({ _id: result.insertedId, ...newMember })
  } catch (error) {
    console.error("POST /api/members error:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}
