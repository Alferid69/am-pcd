"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, KeyRound, Trash2, ShieldAlert, Search, Filter } from "lucide-react";
import {
  getAllUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  adminResetUserPassword,
} from "../../../../api/apiUser";
import { fetchWoredas } from "../../../../api/apiWoredas";
import { fetchRetailers } from "../../../../api/apiRetailers";
import { getZones } from "../../../../api/apiZones";
import { getBureaus } from "../../../../api/apiBureaus";
import { useAuth } from "../../../../contexts/AuthContext";
import { useT } from "next-i18next/client";

import { Button } from "../../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { AlertCircle } from "lucide-react";

export default function UsersPage() {
  const { t } = useT("common");
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSubmitError(null);
    },
    onError: (err: any) => {
      setSubmitError(err?.response?.data?.message ?? t("common.errorUpdating"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) => updateUserAdmin(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditOpen(false);
      setSubmitError(null);
    },
    onError: (err: any) => {
      setSubmitError(err?.response?.data?.message ?? t("common.errorUpdating"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteOpen(false);
      setSubmitError(null);
    },
    onError: (err: any) => {
      setSubmitError(err?.response?.data?.message ?? t("common.errorUpdating"));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { id: string; newPassword: string }) => adminResetUserPassword(data.id, data.newPassword),
    onSuccess: () => {
      setIsResetOpen(false);
      setSubmitError(null);
    },
    onError: (err: any) => {
      setSubmitError(err?.response?.data?.message ?? t("common.errorUpdating"));
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const payload = { ...formData };
    if (payload.role === "admin" || !payload.worksAt) {
      delete (payload as any).worksAt;
    }
    createMutation.mutate(payload);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitError(null);
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
    setSubmitError(null);
    resetPasswordMutation.mutate({ id: selectedUser._id, newPassword });
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    setSubmitError(null);
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
    setSubmitError(null);
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
    setSubmitError(null);
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

  const filteredUsers = users?.filter((user: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower);
      
    const userRoleStr = typeof user.role === 'object' ? user.role.name : user.role;
    const matchesRole = roleFilter === "all" || userRoleStr === roleFilter;

    return matchesSearch && matchesRole;
  }) || [];

  if (userRole !== "admin") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive opacity-80" />
        <h2 className="text-2xl font-bold tracking-tight">{t("common.accessDenied")}</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {t("users.accessDeniedSubtitle", "You do not have permission to view the user management page. Please contact a system administrator.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--bpds-on-surface)">
            {t("users.management")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("users.managementSubtitle")}
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-(--bpds-primary) hover:bg-(--bpds-primary)/90">
          <Plus className="mr-2 h-4 w-4" /> {t("users.addUser")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("users.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">{t("users.allRoles")}</option>
            <option value="admin">{t("dashboard.roles.admin")}</option>
            <option value="bureau">{t("dashboard.roles.retailerCooperativesBureau")}</option>
            <option value="zone">{t("dashboard.roles.zoneTradeBureau")}</option>
            <option value="woreda">{t("dashboard.roles.woredaOffice")}</option>
            <option value="retailer">{t("dashboard.roles.retailerCooperative")}</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("usernameLabel")}</TableHead>
              <TableHead>{t("users.contact")}</TableHead>
              <TableHead>{t("dashboard.table.status")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: any) => (
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
            <DialogTitle>{t("users.createUser")}</DialogTitle>
            <DialogDescription>{t("users.managementSubtitle")}</DialogDescription>
          </DialogHeader>
          {submitError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{submitError}</span>
            </div>
          )}
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("common.firstName")}</Label>
                <Input id="firstName" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("common.lastName")}</Label>
                <Input id="lastName" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t("usernameLabel")}</Label>
              <Input id="username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("common.phone")}</Label>
                <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("common.password")}</Label>
              <Input id="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.status")}</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v || "", worksAt: "" })}>
                <SelectTrigger><SelectValue placeholder={t("users.selectRole")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("dashboard.roles.admin")}</SelectItem>
                  <SelectItem value="bureau">{t("dashboard.roles.retailerCooperativesBureau")}</SelectItem>
                  <SelectItem value="zone">{t("dashboard.roles.zoneTradeBureau")}</SelectItem>
                  <SelectItem value="woreda">{t("dashboard.roles.woredaOffice")}</SelectItem>
                  <SelectItem value="retailer">{t("dashboard.roles.retailerCooperative")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== "admin" && (
              <div className="space-y-2">
                <Label>{t("users.workplace")}</Label>
                <Select value={formData.worksAt} onValueChange={(v) => setFormData({ ...formData, worksAt: v || "" })}>
                  <SelectTrigger><SelectValue placeholder={t("users.selectWorkplace")} /></SelectTrigger>
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
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? t("common.saving") : t("users.createUser")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("users.editUser")}</DialogTitle>
            <DialogDescription>{t("users.managementSubtitle")}</DialogDescription>
          </DialogHeader>
          {submitError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{submitError}</span>
            </div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">{t("common.firstName")}</Label>
                <Input id="edit-firstName" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">{t("common.lastName")}</Label>
                <Input id="edit-lastName" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">{t("usernameLabel")}</Label>
              <Input id="edit-username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t("common.email")}</Label>
                <Input id="edit-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">{t("common.phone")}</Label>
                <Input id="edit-phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.status")}</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v || "", worksAt: "" })}>
                <SelectTrigger><SelectValue placeholder={t("users.selectRole")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("dashboard.roles.admin")}</SelectItem>
                  <SelectItem value="bureau">{t("dashboard.roles.retailerCooperativesBureau")}</SelectItem>
                  <SelectItem value="zone">{t("dashboard.roles.zoneTradeBureau")}</SelectItem>
                  <SelectItem value="woreda">{t("dashboard.roles.woredaOffice")}</SelectItem>
                  <SelectItem value="retailer">{t("dashboard.roles.retailerCooperative")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== "admin" && (
              <div className="space-y-2">
                <Label>{t("users.workplace")}</Label>
                <Select value={formData.worksAt} onValueChange={(v) => setFormData({ ...formData, worksAt: v || "" })}>
                  <SelectTrigger><SelectValue placeholder={t("users.selectWorkplace")} /></SelectTrigger>
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
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("users.resetPassword")}</DialogTitle>
            <DialogDescription>{t("users.resetPasswordDescription", { username: selectedUser?.username })}</DialogDescription>
          </DialogHeader>
          {submitError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{submitError}</span>
            </div>
          )}
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t("common.password")}</Label>
              <Input id="new-password" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending}>{resetPasswordMutation.isPending ? t("common.resetting") : t("users.resetPassword")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("users.deleteUser")}</DialogTitle>
            <DialogDescription>
              {t("users.deleteConfirm", { username: selectedUser?.username })}
            </DialogDescription>
          </DialogHeader>
          {submitError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 mt-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{submitError}</span>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("common.deleting") : t("users.deleteUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
