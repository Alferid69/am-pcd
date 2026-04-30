"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, KeyRound, Trash2, ShieldAlert } from "lucide-react";
import {
  getAllUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  adminResetUserPassword,
} from "../../../api/apiUser";
import { fetchWoredas } from "../../../api/apiWoredas";
import { fetchRetailers } from "../../../api/apiRetailers";
import { getZones } from "../../../api/apiZones";
import { getBureaus } from "../../../api/apiBureaus";
import { useAuth } from "../../../contexts/AuthContext";

import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    role: "retailer",
    worksAt: "",
    password: "",
  });
  const [newPassword, setNewPassword] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const { data: woredas } = useQuery({ queryKey: ["woredas"], queryFn: fetchWoredas });
  const { data: retailers } = useQuery({ queryKey: ["retailers"], queryFn: fetchRetailers });
  const { data: zones } = useQuery({ queryKey: ["zones"], queryFn: getZones });
  const { data: bureaus } = useQuery({ queryKey: ["bureaus"], queryFn: getBureaus });

  const createMutation = useMutation({
    mutationFn: createUserAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) => updateUserAdmin(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteOpen(false);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { id: string; newPassword: string }) => adminResetUserPassword(data.id, data.newPassword),
    onSuccess: () => {
      setIsResetOpen(false);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.role === "admin" || !payload.worksAt) {
      delete (payload as any).worksAt;
    }
    createMutation.mutate(payload);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const payload = { ...formData };
    delete (payload as any).password; // dont update password here
    if (payload.role === "admin" || !payload.worksAt) {
      delete (payload as any).worksAt;
    }
    updateMutation.mutate({ id: selectedUser._id, payload });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    resetPasswordMutation.mutate({ id: selectedUser._id, newPassword });
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    deleteMutation.mutate(selectedUser._id);
  };

  const openCreateModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      role: "retailer",
      worksAt: "",
      password: "",
    });
    setIsCreateOpen(true);
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role.name || user.role,
      worksAt: (typeof user.worksAt === 'object' && user.worksAt !== null) ? (user.worksAt._id || user.worksAt.id) : (user.worksAt || ""),
      password: "",
    });
    setIsEditOpen(true);
  };

  const getWorksAtOptions = (role: string) => {
    const safeArray = (data: any) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.docs && Array.isArray(data.docs)) return data.docs;
      return [];
    };

    switch (role) {
      case "woreda": return safeArray(woredas);
      case "retailer": return safeArray(retailers);
      case "zone": return safeArray(zones);
      case "bureau": return safeArray(bureaus);
      default: return [];
    }
  };

  if (userRole !== "admin") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive opacity-80" />
        <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You do not have permission to view the user management page. Please contact a system administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--bpds-on-surface)">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage user accounts and system access.
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-(--bpds-primary) hover:bg-(--bpds-primary)/90">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user: any) => (
                <TableRow key={user._id} className="group transition-colors hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm">{user.email}</span>
                      <span className="text-xs text-muted-foreground">{user.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role.name || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setNewPassword(""); setIsResetOpen(true); }}>
                        <KeyRound className="h-4 w-4 text-orange-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setIsDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v || "", worksAt: "" })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="bureau">Bureau</SelectItem>
                  <SelectItem value="zone">Zone</SelectItem>
                  <SelectItem value="woreda">Woreda</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== "admin" && (
              <div className="space-y-2">
                <Label>Workplace</Label>
                <Select value={formData.worksAt} onValueChange={(v) => setFormData({ ...formData, worksAt: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Select workplace entity" /></SelectTrigger>
                  <SelectContent>
                    {getWorksAtOptions(formData.role).map((opt: any) => {
                      const id = opt._id || opt.id;
                      if (!id) return null;
                      return (
                        <SelectItem key={id} value={id}>
                          {opt.name || opt.cooperativeName || `Unnamed Entity (${id.slice(-4)})`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Create User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input id="edit-firstName" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input id="edit-lastName" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input id="edit-username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v || "", worksAt: "" })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="bureau">Bureau</SelectItem>
                  <SelectItem value="zone">Zone</SelectItem>
                  <SelectItem value="woreda">Woreda</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== "admin" && (
              <div className="space-y-2">
                <Label>Workplace</Label>
                <Select value={formData.worksAt} onValueChange={(v) => setFormData({ ...formData, worksAt: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Select workplace entity" /></SelectTrigger>
                  <SelectContent>
                    {getWorksAtOptions(formData.role).map((opt: any) => {
                      const id = opt._id || opt.id;
                      if (!id) return null;
                      return (
                        <SelectItem key={id} value={id}>
                          {opt.name || opt.cooperativeName || `Unnamed Entity (${id.slice(-4)})`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Enter a new password for {selectedUser?.username}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending}>{resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user {selectedUser?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
