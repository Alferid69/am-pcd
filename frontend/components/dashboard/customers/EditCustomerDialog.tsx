"use client";

import React, { useState } from "react";
import { Edit2, AlertCircle } from "lucide-react";
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
import { updateCustomer } from "../../../api/apiCustomers";
import type { Customer, CreateCustomerPayload } from "../types";
import { useAuth } from "../../../contexts/AuthContext";

import { fetchWoredas } from "../../../api/apiWoredas";
import { useQuery } from "@tanstack/react-query";

export default function EditCustomerDialog({ customer }: { customer: Customer }) {
  const { worksAt: woredaId, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    gender: customer.gender,
    age: String(customer.age),
    fayda: customer.fayda,
    phone: customer.phone,
    kebele: customer.kebele || "",
    houseNumber: customer.houseNumber || "",
    woreda: typeof customer.woreda === "string" ? customer.woreda : (customer.woreda as any)?._id || "",
  });

  const { data: woredas = [], isLoading: isLoadingWoredas } = useQuery({
    queryKey: ["woredas"],
    queryFn: fetchWoredas,
    enabled: userRole === "admin",
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateCustomerPayload>) => updateCustomer(customer._id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsOpen(false);
      setSubmitError(null);
    },
    onError: (err: any) => {
      setSubmitError(
        err?.response?.data?.message ??
          "Failed to update customer. Please try again.",
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
      setSubmitError("Fayda number must be exactly 16 digits.");
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
      setSubmitError("Please fill out all required fields.");
      return;
    }

    const finalWoredaId = userRole === "admin" ? formData.woreda : woredaId;

    if (!finalWoredaId) {
      setSubmitError("Woreda context not found. Please log in again.");
      return;
    }

    const payload: Partial<CreateCustomerPayload> = {
      ...formData,
      age: Number(formData.age),
      woreda: finalWoredaId,
    };

    updateMutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-900/20"
          />
        }
      >
        <Edit2 className="h-4 w-4 mr-2" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update the customer&lsquo;s details.
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
              <Label htmlFor="woreda">Woreda Office</Label>
              <Select
                value={formData.woreda}
                onValueChange={(val) => handleSelectChange("woreda", val as string)}
                disabled={isLoadingWoredas}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingWoredas ? "Loading woredas..." : "Select Woreda"}>
                    {formData.woreda
                      ? woredas.find((w: any) => w._id === formData.woreda)?.name || "Select Woreda"
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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
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
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value as "male" | "female")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
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
            <Label htmlFor="fayda">Fayda National ID (16 digits)</Label>
            <Input
              id="fayda"
              name="fayda"
              type="text"
              maxLength={16}
              placeholder="e.g. 1234567890123456"
              value={formData.fayda}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+251..."
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kebele">Kebele</Label>
              <Input
                id="kebele"
                name="kebele"
                placeholder="e.g. 01"
                value={formData.kebele}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseNumber">House Number</Label>
              <Input
                id="houseNumber"
                name="houseNumber"
                placeholder="e.g. 123"
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
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
