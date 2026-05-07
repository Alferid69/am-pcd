"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Building2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";

import { fetchWoredas, createWoredaOffice } from "../../../../api/apiWoredas";
import { fetchRetailers, createRetailerCooperative } from "../../../../api/apiRetailers";
import { getZones, createZoneTradeBureau } from "../../../../api/apiZones";
import { getBureaus, createBureau } from "../../../../api/apiBureaus";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useT } from "next-i18next/client";


export default function EntitiesPage() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useT("common");

  const [activeTab, setActiveTab] = useState(userRole === "bureau" ? "retailers" : "woredas");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    woredaOffice: "",
  });

  const { data: woredas = [], isLoading: isLoadingWoredas } = useQuery({ queryKey: ["woredas"], queryFn: fetchWoredas });
  const { data: retailers = [], isLoading: isLoadingRetailers } = useQuery({ queryKey: ["retailers"], queryFn: fetchRetailers });
  const { data: zones = [], isLoading: isLoadingZones } = useQuery({ queryKey: ["zones"], queryFn: getZones });
  const { data: bureaus = [], isLoading: isLoadingBureaus } = useQuery({ queryKey: ["bureaus"], queryFn: getBureaus });

  const woredaMutation = useMutation({
    mutationFn: createWoredaOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["woredas"] });
      closeDialog();
    },
    onError: (err: any) => setSubmitError(err?.response?.data?.message || t("entities.failedToCreate", { type: t("entities.woredas").replace(/s$/, '') })),
  });

  const retailerMutation = useMutation({
    mutationFn: createRetailerCooperative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retailers"] });
      closeDialog();
    },
    onError: (err: any) => setSubmitError(err?.response?.data?.message || t("entities.failedToCreate", { type: t("entities.retailers").replace(/s$/, '') })),
  });

  const zoneMutation = useMutation({
    mutationFn: createZoneTradeBureau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      closeDialog();
    },
    onError: (err: any) => setSubmitError(err?.response?.data?.message || t("entities.failedToCreate", { type: t("entities.zones").replace(/s$/, '') })),
  });

  const bureauMutation = useMutation({
    mutationFn: createBureau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bureaus"] });
      closeDialog();
    },
    onError: (err: any) => setSubmitError(err?.response?.data?.message || t("entities.failedToCreate", { type: t("entities.bureaus").replace(/s$/, '') })),
  });

  const closeDialog = () => {
    setIsAddOpen(false);
    setFormData({ name: "", email: "", woredaOffice: "" });
    setSubmitError(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (activeTab === "woredas") {
      woredaMutation.mutate({ name: formData.name, email: formData.email });
    } else if (activeTab === "retailers") {
      if (!formData.woredaOffice) {
        setSubmitError(t("entities.selectWoredaError"));
        return;
      }
      retailerMutation.mutate({ name: formData.name, woredaOffice: formData.woredaOffice });
    } else if (activeTab === "zones") {
      zoneMutation.mutate({ name: formData.name, email: formData.email });
    } else if (activeTab === "bureaus") {
      bureauMutation.mutate({ name: formData.name, email: formData.email });
    }
  };

  if (userRole !== "admin" && userRole !== "bureau") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive opacity-80" />
        <h2 className="text-2xl font-bold tracking-tight">{t("common.accessDenied")}</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {t("users.accessDeniedSubtitle")}
        </p>
      </div>
    );
  }

  const availableTabs = [
    { id: "woredas", label: t("entities.woredas"), roles: ["admin"] },
    { id: "retailers", label: t("entities.retailers"), roles: ["admin", "bureau"] },
    { id: "zones", label: t("entities.zones"), roles: ["admin"] },
    { id: "bureaus", label: t("entities.bureaus"), roles: ["admin"] },
  ].filter(t => t.roles.includes(userRole));

  const isPending = woredaMutation.isPending || retailerMutation.isPending || zoneMutation.isPending || bureauMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--bpds-on-surface)">
            {t("entities.management")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("entities.managementSubtitle")}
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-(--bpds-primary) hover:bg-(--bpds-primary)/90">
          <Plus className="mr-2 h-4 w-4" /> {t("entities.add")}
        </Button>
      </div>

      <div className="w-full">
        <div className="flex space-x-1 rounded-xl bg-muted p-1 w-full sm:w-auto overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === "woredas" && (
          <div className="mt-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("common.email")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingWoredas ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6">{t("common.loading")}</TableCell></TableRow>
                  ) : woredas.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">{t("entities.noWoredas")}</TableCell></TableRow>
                  ) : (
                    woredas.map((w: any) => (
                      <TableRow key={w._id}>
                        <TableCell className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground"/> {w.name}</TableCell>
                        <TableCell>{w.email || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "retailers" && (
          <div className="mt-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("woredas.name")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRetailers ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6">{t("common.loading")}</TableCell></TableRow>
                  ) : retailers.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">{t("entities.noRetailers")}</TableCell></TableRow>
                  ) : (
                    retailers.map((r: any) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground"/> {r.name}</TableCell>
                        <TableCell>{r.woredaOffice?.name || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "zones" && (
          <div className="mt-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("common.email")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingZones ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6">{t("common.loading")}</TableCell></TableRow>
                  ) : zones.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">{t("entities.noZones")}</TableCell></TableRow>
                  ) : (
                    zones.map((z: any) => (
                      <TableRow key={z._id}>
                        <TableCell className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground"/> {z.name}</TableCell>
                        <TableCell>{z.email || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "bureaus" && (
          <div className="mt-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("common.email")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBureaus ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6">{t("common.loading")}</TableCell></TableRow>
                  ) : bureaus.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">{t("entities.noBureaus")}</TableCell></TableRow>
                  ) : (
                    bureaus.map((b: any) => (
                      <TableRow key={b._id}>
                        <TableCell className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground"/> {b.name}</TableCell>
                        <TableCell>{b.email || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="capitalize">{t("entities.addNew", { type: t(`entities.${activeTab}`).replace(/s$/, '') })}</DialogTitle>
            <DialogDescription>{t("entities.enterDetails")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {submitError && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{submitError}</div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {activeTab !== "retailers" && (
              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required={activeTab === "zones"} />
              </div>
            )}

            {activeTab === "retailers" && (
              <div className="space-y-2">
                <Label htmlFor="woredaOffice">{t("woredas.name")}</Label>
                <Select value={formData.woredaOffice} onValueChange={(val) => setFormData({ ...formData, woredaOffice: val as string })}>
                  <SelectTrigger><SelectValue placeholder={t("entities.selectWoreda")} /></SelectTrigger>
                  <SelectContent>
                    {woredas.map((w: any) => (
                      <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={isPending}>{isPending ? t("common.saving") : t("entities.createEntity")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
