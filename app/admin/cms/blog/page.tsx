"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsApi } from "@/lib/api/cms";
import { parseApiError } from "@/lib/api/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import type { BlogPost } from "@/lib/types/cms.types";

const schema = z.object({
  title:      z.string().min(1, "Required"),
  slug:       z.string().min(1, "Required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  excerpt:    z.string().optional(),
  content:    z.string().min(1, "Content is required"),
  cover_url:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_published: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function BlogForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_published: false, ...defaultValues },
  });

  const title = watch("title");
  const handleTitleBlur = () => {
    if (!defaultValues?.slug) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Title" error={errors.title?.message} required>
        <Input {...register("title")} placeholder="Blog post title" onBlur={handleTitleBlur} />
      </FormField>
      <FormField label="Slug" error={errors.slug?.message} required hint="URL-friendly identifier">
        <Input {...register("slug")} placeholder="my-blog-post" className="font-mono text-sm" />
      </FormField>
      <FormField label="Excerpt">
        <Textarea {...register("excerpt")} placeholder="Short summary shown in listings..." rows={2} />
      </FormField>
      <FormField label="Content" error={errors.content?.message} required>
        <Textarea {...register("content")} placeholder="Full blog content..." rows={6} />
      </FormField>
      <FormField label="Cover Image URL" error={errors.cover_url?.message}>
        <Input {...register("cover_url")} placeholder="https://..." />
      </FormField>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_published" {...register("is_published")} className="rounded" />
        <label htmlFor="is_published" className="text-sm text-slate-600">Published (visible on site)</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isPending}>Save Post</Button>
      </DialogFooter>
    </form>
  );
}

export default function BlogPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["cms", "blog"], queryFn: cmsApi.listBlogPosts });
  const create = useMutation({
    mutationFn: cmsApi.createBlogPost,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms", "blog"] }); toast.success("Post created."); setOpen(false); },
    onError: (e) => toast.error(parseApiError(e)),
  });
  const update = useMutation({
    mutationFn: ({ id, ...data }: Partial<BlogPost> & { id: string }) => cmsApi.updateBlogPost(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms", "blog"] }); toast.success("Post updated."); setOpen(false); setEditing(null); },
    onError: (e) => toast.error(parseApiError(e)),
  });
  const del = useMutation({
    mutationFn: cmsApi.deleteBlogPost,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms", "blog"] }); toast.success("Post deleted."); },
    onError: (e) => toast.error(parseApiError(e)),
  });

  const handleSubmit = (v: FormValues) => {
    const payload = { ...v, cover_url: v.cover_url || undefined };
    if (editing) {
      update.mutate({ id: editing.id, ...payload });
    } else {
      create.mutate(payload);
    }
  };

  const posts: BlogPost[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Blog Posts</h2>
          <p className="text-xs text-slate-400 mt-0.5">Content articles shown on your booking site</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />New Post
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Title", "Slug", "Status", "Created", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-28" /></td>
                      ))}
                    </tr>
                  ))
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <BookOpen className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No blog posts yet.</p>
                    </td>
                  </tr>
                ) : (
                  posts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 first:pl-5 font-medium text-slate-800 max-w-[240px] truncate">{p.title}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{p.slug}</td>
                      <td className="py-3 px-4">
                        <Badge variant={p.is_published ? "success" : "secondary"}>
                          {p.is_published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4 last:pr-5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditing(p); setOpen(true); }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => del.mutate(p.id)} disabled={del.isPending} className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => { setOpen(false); setEditing(null); }} size="lg">
        <DialogHeader title={editing ? "Edit Blog Post" : "New Blog Post"} onClose={() => { setOpen(false); setEditing(null); }} />
        <DialogBody>
          <BlogForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setOpen(false); setEditing(null); }}
            isPending={create.isPending || update.isPending}
          />
        </DialogBody>
      </Dialog>
    </div>
  );
}
