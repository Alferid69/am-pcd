"use client";

import React, { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import { fetchWoredas } from "../../../api/apiWoredas";
import type { CreateCustomerPayload } from "../types";
import { useAuth } from "../../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { createCustomer } from "@/api/apiCustomers";
import { useT } from "next-i18next/client";

export default function CreateCustomerDialog() {
  const { worksAt: woredaId, userRole } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useT("common");
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "male" as "male" | "female",
    age: "",
    fayda: "",
    phone: "",
    kebele: "",
    houseNumber: "",
    woreda: "",
  });

  const { data: woredas = [], isLoading: isLoadingWoredas } = useQuery({
    queryKey: ["woredas"],
    queryFn: fetchWoredas,
    enabled: userRole === "admin",
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        gender: "male",
        age: "",
        fayda: "",
        phone: "",
        kebele: "",
        houseNumber: "",
        woreda: "",
      });
      setSubmitError(null);
    },
    onError: (err: any) => {
      setSubmitError(
        err?.response?.data?.message ??
          t("customers.errorFailedToCreate"),
      );
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate 16-digit Fayda
    if (!/^\d{16}$/.test(formData.fayda)) {
      setSubmitError(t("customers.errorFaydaDigits"));
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.age ||
      !formData.phone ||
      !formData.kebele ||
      !formData.houseNumber
    ) {
      setSubmitError(t("customers.errorFillRequired"));
      return;
    }

    // Get Woreda ID
    const finalWoredaId = userRole === "admin" ? formData.woreda : woredaId;

    if (!finalWoredaId) {
      setSubmitError(t("customers.errorSelectWoreda"));
      return;
    }

    const payload: CreateCustomerPayload = {
      ...formData,
      age: Number(formData.age),
      woreda: finalWoredaId,
      status: "available",
    };

    createMutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button className="bg-(--bpds-primary) hover:bg-(--bpds-primary)/90" />}>
        <Plus className="mr-2 h-4 w-4" />
        {t("customers.add")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("customers.registerNew")}</DialogTitle>
          <DialogDescription>
            {t("customers.registerDescription")}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="mb-4 flex items-center rounded-md bg-(--bpds-error-container) p-3 text-(--bpds-on-error-container)">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span className="text-sm">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {userRole === "admin" && (
            <div className="space-y-2">
              <Label htmlFor="woreda">{t("woredas.offices")}</Label>
              <Select
                value={formData.woreda}
                onValueChange={(val) => handleSelectChange("woreda", val as string)}
                disabled={isLoadingWoredas}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingWoredas ? t("woredas.loadingWoredas") : t("entities.selectWoreda")}>
                    {formData.woreda
                      ? woredas.find((w: any) => w._id === formData.woreda)?.name || t("entities.selectWoreda")
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {woredas.map((w: any) => (
                    <SelectItem key={w._id} value={w._id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("common.firstName")}</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("common.lastName")}</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">{t("common.gender")}</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  handleSelectChange("gender", value as "male" | "female")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("customers.selectGender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("common.male")}</SelectItem>
                  <SelectItem value="female">{t("common.female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">{t("common.age")}</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="0"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fayda">{t("customers.faydaIDLabel")}</Label>
            <Input
              id="fayda"
              name="fayda"
              type="text"
              maxLength={16}
              placeholder={t("customers.faydaPlaceholder")}
              value={formData.fayda}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t("common.phonePlaceholder")}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kebele">{t("customers.kebele")}</Label>
              <Input
                id="kebele"
                name="kebele"
                placeholder={t("customers.kebelePlaceholder")}
                value={formData.kebele}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseNumber">{t("customers.houseNumber")}</Label>
              <Input
                id="houseNumber"
                name="houseNumber"
                placeholder={t("customers.houseNumberPlaceholder")}
                value={formData.houseNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t("customers.registering") : t("customers.register")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
