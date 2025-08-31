"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Users,
  Clock,
  Search,
  RotateCcw,
  History,
  BookMarked,
  Calendar,
  User,
  Plus,
  LogOut,
  UserPlus,
  Mail,
  Phone,
} from "lucide-react"

interface Book {
  _id?: string
  title: string
  author: string
  category: string
  available: boolean
  coverImage?: string
  borrowedBy?: string
  borrowerPhone?: string
  borrowedDate?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

interface Member {
  _id?: string
  name: string
  email: string
  phone: string
  password: string
  joinDate?: string
  createdAt?: string
  updatedAt?: string
}

interface BorrowHistory {
  _id?: string
  bookTitle: string
  borrower: string
  borrowerPhone?: string
  borrowedDate: string
  dueDate: string
  returnedDate?: string | null
  status: "borrowed" | "returned"
  createdAt?: string
  updatedAt?: string
}

interface AdminDashboardProps {
  username: string
  onLogout: () => void
}

export function AdminDashboard({ username, onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [borrowhistories, setBorrowhistories] = useState<BorrowHistory[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch books
  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books")
      if (res.ok) {
        const data = await res.json()
        setBooks(data)
      }
    } catch (err) {
      console.error("Failed to fetch books:", err)
    }
  }

  // Fetch members
  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members")
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (err) {
      console.error("Failed to fetch members:", err)
    }
  }

  // Fetch borrow histories
  const fetchBorrowhistories = async () => {
    try {
      const res = await fetch("/api/borrowhistories")
      if (res.ok) {
        const data = await res.json()
        setBorrowhistories(data)
      }
    } catch (err) {
      console.error("Failed to fetch borrow histories:", err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchBooks(), fetchMembers(), fetchBorrowhistories()])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  )

  const filteredBorrowhistories = borrowhistories.filter(
    (bh) =>
      bh.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bh.borrower.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">ระบบจัดการห้องสมุด</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาหนังสือ หรือผู้ยืม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">สวัสดี, {username}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="books">จัดการหนังสือ</TabsTrigger>
            <TabsTrigger value="borrowhistories">การยืม-คืน</TabsTrigger>
            <TabsTrigger value="members">สมาชิก</TabsTrigger>
           
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">หนังสือทั้งหมด</CardTitle>
                  <BookMarked className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{books.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">หนังสือที่ถูกยืม</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {books.filter((b) => !b.available).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">การยืมที่ใช้งานอยู่</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {borrowhistories.filter((bh) => bh.status === "borrowed").length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">สมาชิกทั้งหมด</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{members.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">หนังสือเกินกำหนด</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {borrowhistories.filter((bh) => {
                      if (bh.status !== "borrowed") return false
                      const today = new Date()
                      const due = new Date(bh.dueDate)
                      return today > due
                    }).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>จัดการหนังสือ</CardTitle>
                <CardDescription>รายการหนังสือทั้งหมดในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBooks.map((b) => (
                    <div key={b._id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <h3 className="font-medium">{b.title}</h3>
                        <p className="text-sm text-muted-foreground">โดย {b.author}</p>
                        <p className="text-xs text-muted-foreground">หมวดหมู่: {b.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={b.available ? "default" : "secondary"}>
                          {b.available ? "พร้อมให้ยืม" : `ถูกยืมโดย ${b.borrowedBy || ""}`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BorrowHistories Tab */}
          <TabsContent value="borrowhistories" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>การยืม-คืนหนังสือ</CardTitle>
      <CardDescription>รายการยืม-คืนทั้งหมด</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {filteredBorrowhistories.map((bh) => (
          <div
            key={bh._id}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex-1">
              <h3 className="font-medium">{bh.bookTitle}</h3>
              <p className="text-sm text-muted-foreground">ผู้ยืม: {bh.borrower}</p>
              <p className="text-xs text-muted-foreground">
                วันที่ยืม: {new Date(bh.borrowedDate).toLocaleDateString("th-TH")} | กำหนดคืน:{" "}
                {new Date(bh.dueDate).toLocaleDateString("th-TH")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={bh.status === "borrowed" ? "default" : "secondary"}>
                {bh.status === "borrowed" ? "กำลังยืม" : "คืนแล้ว"}
              </Badge>

              {bh.status === "borrowed" && bh._id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/borrowhistories/${bh._id}/return`, {
                        method: "PUT",
                      });

                      if (!res.ok) throw new Error("คืนหนังสือไม่สำเร็จ");

                      // อัปเดต UI
                      setBorrowhistories((prev) =>
                        prev.map((item) =>
                          item._id === bh._id
                            ? { ...item, status: "returned", returnedDate: new Date().toISOString() }
                            : item
                        )
                      );
                    } catch (err) {
                      console.error(err);
                      alert("คืนหนังสือไม่สำเร็จ กรุณาลองใหม่");
                    }
                  }}
                >
                  คืน
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</TabsContent>


          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>สมาชิก</CardTitle>
                <CardDescription>รายการสมาชิกทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMembers.map((m) => (
                    <div key={m._id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <h3 className="font-medium">{m.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {m.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {m.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
