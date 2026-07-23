"use client";

import { useState } from "react";
import { PlusIcon, Edit3, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/features/admin/hooks/useAdmin";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; slug: string; icon: string; description: string } | null>(null);

  const [formData, setFormData] = useState({ name: "", slug: "", icon: "", description: "" });

  const filtered = (categories ?? []).filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", slug: "", icon: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: { id: string; name: string; slug: string; icon: string | null; description: string | null }) => {
    setEditing({ ...cat, icon: cat.icon ?? "", description: cat.description ?? "" });
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon ?? "",
      description: cat.description ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await updateCategory.mutateAsync({
        categoryId: editing.id,
        data: {
          name: formData.name,
          slug: formData.slug,
          icon: formData.icon || null,
          description: formData.description || null,
        },
      });
    } else {
      await createCategory.mutateAsync({
        name: formData.name,
        slug: formData.slug || slugify(formData.name),
        icon: formData.icon || undefined,
        description: formData.description || undefined,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage course categories.</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" /> Add Category
        </Button>
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cat) => (
          <div key={cat.id} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-lg">
                {cat.icon ?? "📁"}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>
                  <Edit3 className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-foreground">{cat.name}</h3>
            <p className="text-xs text-muted-foreground">/{cat.slug}</p>
            {cat.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">{cat.course_count} course{cat.course_count !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the category details." : "Add a new course category."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, name: e.target.value }));
                  if (!editing) setFormData((p) => ({ ...p, slug: slugify(e.target.value) }));
                }}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Icon (emoji or URL)</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                placeholder="🚀"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleSave} loading={createCategory.isPending || updateCategory.isPending}>
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


