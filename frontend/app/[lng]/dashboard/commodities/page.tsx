"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Search, ShoppingBag } from "lucide-react";
import {
  fetchCommodities,
  createCommodity,
  updateCommodity,
  deleteCommodity,
  Commodity,
} from "../../../../api/apiCommodities";
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
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "../../../../components/ui/card";

export default function CommoditiesPage() {
  const { userRole, isLoading: authLoading } = useAuth();
  const { t } = useT("common");
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(
    null,
  );

  // Form states
  const [formData, setFormData] = useState<Partial<Commodity>>({
    name: "",
    price: 0,
    baseUnit: "",
    bulkUnit: "",
    conversionRate: 1,
    maxAmountPerCustomer: 5,
  });

  const { data: commodities = [], isLoading } = useQuery({
    queryKey: ["commodities"],
    queryFn: fetchCommodities,
  });

  const createMutation = useMutation({
    mutationFn: createCommodity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      setIsAddOpen(false);
      toast.success(t("commoditiesManagement.createSuccess"));
      resetForm();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create commodity",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Commodity> }) =>
      updateCommodity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      setIsEditOpen(false);
      toast.success(t("commoditiesManagement.updateSuccess"));
      resetForm();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update commodity",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCommodity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      setIsDeleteOpen(false);
      toast.success(t("commoditiesManagement.deleteSuccess"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete commodity",
      );
    },
  });

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground animate-pulse">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  // Only admin and bureau can access this page
  if (userRole !== "admin" && userRole !== "bureau") {
    return (
      <div className="flex justify-center py-20 text-red-500">
        {t("common.accessDenied")}
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      baseUnit: "",
      bulkUnit: "",
      conversionRate: 1,
      maxAmountPerCustomer: 5,
    });
    setSelectedCommodity(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCommodity) {
      updateMutation.mutate({ id: selectedCommodity._id, data: formData });
    }
  };

  const handleDelete = () => {
    if (selectedCommodity) {
      deleteMutation.mutate(selectedCommodity._id);
    }
  };

  const openEditModal = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    setFormData({
      name: commodity.name,
      price: commodity.price,
      baseUnit: commodity.baseUnit,
      bulkUnit: commodity.bulkUnit,
      conversionRate: commodity.conversionRate,
      maxAmountPerCustomer: commodity.maxAmountPerCustomer,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    setIsDeleteOpen(true);
  };

  const filteredCommodities = commodities.filter((c: Commodity) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-(--bpds-primary)" />
            {t("commoditiesManagement.title")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("commoditiesManagement.subtitle")}
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button
              onClick={resetForm}
              className="bg-(--bpds-primary) text-(--bpds-on-primary) hover:bg-(--bpds-primary)/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("commoditiesManagement.add")}
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("commoditiesManagement.add")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("commoditiesManagement.name")}</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("commoditiesManagement.price")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("commoditiesManagement.baseUnit")}</Label>
                  <Input
                    required
                    value={formData.baseUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, baseUnit: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("commoditiesManagement.bulkUnit")}</Label>
                  <Input
                    required
                    value={formData.bulkUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, bulkUnit: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("commoditiesManagement.conversionRate")}</Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.conversionRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conversionRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("commoditiesManagement.maxAmountPerCustomer")}</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={formData.maxAmountPerCustomer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxAmountPerCustomer: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending
                    ? t("common.loading")
                    : t("common.save")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("commoditiesManagement.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-(--bpds-surface-container-low)">
              <TableRow>
                <TableHead>{t("commoditiesManagement.name")}</TableHead>
                <TableHead>{t("commoditiesManagement.price")}</TableHead>
                <TableHead>{t("commoditiesManagement.baseUnit")}</TableHead>
                <TableHead>{t("commoditiesManagement.bulkUnit")}</TableHead>
                <TableHead>
                  {t("commoditiesManagement.conversionRate")}
                </TableHead>
                <TableHead>
                  {t("commoditiesManagement.maxAmountPerCustomer")}
                </TableHead>
                <TableHead className="text-right">
                  {t("commoditiesManagement.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t("commoditiesManagement.loading")}
                  </TableCell>
                </TableRow>
              ) : filteredCommodities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t("commoditiesManagement.noCommodities")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommodities.map((commodity: Commodity) => (
                  <TableRow key={commodity._id}>
                    <TableCell className="font-medium capitalize">
                      {commodity.name}
                    </TableCell>
                    <TableCell>{commodity.price?.toFixed(2)} ETB</TableCell>
                    <TableCell>{commodity.baseUnit}</TableCell>
                    <TableCell>{commodity.bulkUnit}</TableCell>
                    <TableCell>{commodity.conversionRate}</TableCell>
                    <TableCell>
                      {commodity.maxAmountPerCustomer} {commodity.baseUnit}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(commodity)}
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteModal(commodity)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("commoditiesManagement.edit")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t("commoditiesManagement.name")}</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("commoditiesManagement.price")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("commoditiesManagement.baseUnit")}</Label>
                <Input
                  required
                  value={formData.baseUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, baseUnit: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("commoditiesManagement.bulkUnit")}</Label>
                <Input
                  required
                  value={formData.bulkUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, bulkUnit: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("commoditiesManagement.conversionRate")}</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.conversionRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conversionRate: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("commoditiesManagement.maxAmountPerCustomer")}</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={formData.maxAmountPerCustomer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxAmountPerCustomer: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("commoditiesManagement.confirmDeleteTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t("commoditiesManagement.confirmDeleteMsg")}
            </p>
            {selectedCommodity && (
              <div className="mt-2 p-3 bg-muted rounded-md border text-sm font-medium">
                {selectedCommodity.name} - {selectedCommodity.price} ETB
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? t("common.loading")
                : t("commoditiesManagement.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
