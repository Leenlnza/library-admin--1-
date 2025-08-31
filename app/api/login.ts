// /pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next"
import { sign } from "jsonwebtoken"

const SECRET = process.env.JWT_SECRET || "your-secret-key"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const { email, password } = req.body

  // ตรวจสอบผู้ใช้จาก DB (ตัวอย่าง mock)
  if (email === "admin@example.com" && password === "1234") {
    const token = sign({ email }, SECRET, { expiresIn: "1d" })

    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`
    )

    return res.status(200).json({ email })
  }

  return res.status(401).json({ message: "Invalid credentials" })
}
