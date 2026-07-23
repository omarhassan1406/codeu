"use client";

import { useState } from "react";
import { Search, Shield, ShieldOff, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminUsers, useUpdateUserRole } from "@/features/admin/hooks/useAdmin";

const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"> = {
  admin: "destructive",
  instructor: "default",
  student: "secondary",
};

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [newRole, setNewRole] = useState("");

  const filtered = (users ?? []).filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleRoleUpdate = async () => {
    if (!editUser || !newRole) return;
    await updateRole.mutateAsync({ userId: editUser.id, role: newRole });
    setEditUser(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and roles.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {["all", "student", "instructor", "admin"].map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                roleFilter === f
                  ? "bg-brand-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Courses</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Enrollments</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Joined</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="size-full rounded-full object-cover" /> : <User className="size-4" />}
                    </div>
                    <span className="font-medium text-foreground">{u.name}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={roleColors[u.role] ?? "secondary"}>{u.role}</Badge>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{u.course_count}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{u.enrollment_count}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditUser({ id: u.id, name: u.name, currentRole: u.role });
                      setNewRole(u.role);
                    }}
                  >
                    {u.role === "admin" ? <ShieldOff className="size-4" /> : <Shield className="size-4" />}
                    Change Role
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update role for {editUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Role</label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v ?? "student")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleRoleUpdate} loading={updateRole.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
