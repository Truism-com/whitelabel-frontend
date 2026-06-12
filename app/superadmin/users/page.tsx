"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { superadminApi } from "@/lib/api/superadmin";
import { formatDate } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, ShieldAlert } from "lucide-react";

export default function UserLookupPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["superadmin-users-search", activeQuery],
    queryFn: () => superadminApi.searchUsers(activeQuery),
    enabled: activeQuery !== "",
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-950">Global User Lookup</h1>
        <p className="text-xs text-slate-500 mt-0.5">Find and inspect user accounts across all tenant boundaries</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <Input
                placeholder="Search by name, email, or tenant code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-100 bg-red-50/50">
          <CardContent className="p-4 flex items-center gap-3 text-red-700">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              Failed to lookup users. Please check the backend connection.
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Lookup Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !activeQuery ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              Enter a search query to search for users.
            </div>
          ) : (users ?? []).length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching users found for &ldquo;{activeQuery}&rdquo;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users ?? []).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold text-slate-900">{user.name}</TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "superadmin"
                              ? "destructive"
                              : user.role === "admin"
                              ? "default"
                              : user.role === "agent"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{user.tenant_name ?? user.tenant_id ?? "platform"}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "success" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
