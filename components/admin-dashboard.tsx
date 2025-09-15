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
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [borrowhistories, setBorrowhistories] = useState<BorrowHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newAuthor, setNewAuthor] = useState("")
  const [newCategory, setNewCategory] = useState("")

  // โหลด username จาก localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("username")
    if (storedUser) {
      setCurrentUser(storedUser)
    } else if (username) {
      setCurrentUser(username)
      localStorage.setItem("username", username)
    }
  }, [username])

  const handleLogout = () => {
    localStorage.removeItem("username")
    setCurrentUser(null)
    onLogout()
  }
  const [borrowFilter, setBorrowFilter] = useState<"all" | "today" | "7days" | "month">("all")
  
  // ------------------- Fetch -------------------
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

  // ------------------- Filters -------------------
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

  const filteredBorrowhistories = borrowhistories.filter((bh) => {
  const matchSearch =
    bh.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bh.borrower.toLowerCase().includes(searchTerm.toLowerCase())

  if (!matchSearch) return false

  const today = new Date()
  const dueDate = new Date(bh.dueDate)

  if (borrowFilter === "today") {
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    )
  }

  if (borrowFilter === "7days") {
    const past7 = new Date()
    past7.setDate(today.getDate() - 7)
    return dueDate >= past7 && dueDate <= today
  }

  if (borrowFilter === "month") {
    return (
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    )
  }

  return true // กรณี all
})


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
              <span className="text-sm text-muted-foreground">
                สวัสดี, {currentUser || "ผู้ใช้"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 bg-transparent"
              >
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
                <CardContent style={{ color: "hsl(var(--primary))" }}>
                  <div className="text-2xl font-bold text-secondary  "style={{ color: "hsl(var(--primary))" }}>
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
    <div
      className="text-2xl font-bold"
      style={{ color: "hsl(var(--primary))" }}
    >
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
                  <TabsContent value="books" className="space-y-6">
  <Card>
    <CardHeader className="flex justify-between items-center">
      <div>
        <CardTitle>จัดการหนังสือ</CardTitle>
        <CardDescription>รายการหนังสือทั้งหมดในระบบ</CardDescription>
      </div>
                    
      {/* ปุ่มเพิ่มหนังสือ */}
      <Dialog>
  <DialogTrigger asChild>
    <Button size="sm" variant="outline" className="gap-2">
      <Plus className="h-4 w-4" /> เพิ่มหนังสือ
    </Button>
  </DialogTrigger>



  <DialogContent className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white/30 backdrop-blur-md shadow-lg border border-gray-200 rounded-lg">
    <DialogHeader>
      <DialogTitle>เพิ่มหนังสือใหม่</DialogTitle>
      <DialogDescription>กรอกข้อมูลหนังสือที่ต้องการเพิ่ม</DialogDescription>
    </DialogHeader>

    <div className="space-y-4 mt-2">
      <Label>ชื่อหนังสือ</Label>
      <Input
        placeholder="ชื่อหนังสือ"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <Label>ผู้แต่ง</Label>
      <Input
        placeholder="ผู้แต่ง"
        value={newAuthor}
        onChange={(e) => setNewAuthor(e.target.value)}
      />
      <Label>หมวดหมู่</Label>
      <Input
        placeholder="หมวดหมู่"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
    </div>

    <DialogFooter>
      <Button
        type="button"
        className="w-full"
        onClick={async () => {
          if (!newTitle || !newAuthor || !newCategory) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
          }

          const newBook = {
            title: newTitle,
            author: newAuthor,
            category: newCategory,
            available: true,
            borrowedBy: null,
            borrowerPhone: null,
            borrowedDate: null,
            dueDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          try {
            const res = await fetch("/api/books", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newBook),
            });

            if (!res.ok) throw new Error("เพิ่มหนังสือไม่สำเร็จ");

            const addedBook = await res.json();

            setBooks((prev) => [...prev, addedBook]);

            setNewTitle("");
            setNewAuthor("");
            setNewCategory("");

            alert("เพิ่มหนังสือเรียบร้อยแล้ว");
          } catch (err) {
            console.error(err);
            alert("เพิ่มหนังสือไม่สำเร็จ กรุณาลองใหม่");
          }
        }}
      >
        เพิ่ม
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

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

          {/* Books Tab */}
 
                  
          {/* BorrowHistories Tab */}
          <TabsContent value="borrowhistories" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>การยืม-คืนหนังสือ</CardTitle>
      <CardDescription>รายการยืม-คืนทั้งหมด</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 mb-4">
  <Label>กรองตามกำหนดคืน:</Label>
  <select
    value={borrowFilter}
    onChange={(e) => setBorrowFilter(e.target.value as any)}
    className="border rounded px-2 py-1"
  >
    <option value="all">ทั้งหมด</option>
    <option value="today">กำหนดคืนวันนี้</option>
    <option value="7days">ภายใน 7 วันที่ผ่านมา</option>
    <option value="month">เดือนนี้</option>
  </select>
</div>
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
