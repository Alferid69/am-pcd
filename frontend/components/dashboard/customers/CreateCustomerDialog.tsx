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
import { createCustomer } from "../../../api/apiCustomers";
import type { CreateCustomerPayload } from "../types";
import { useAuth } from "../../../contexts/AuthContext";

export default function CreateCustomerDialog() {
  const { worksAt: woredaId } = useAuth();
  const queryClient = useQueryClient();
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
      });
      setSubmitError(null);
    },
    onError: (err: any) => {
      setSubmitError(
        err?.response?.data?.message ??
          "Failed to create customer. Please try again.",
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

    // Get Woreda ID from auth context

    if (!woredaId) {
      setSubmitError("Woreda context not found. Please log in again.");
      return;
    }

    const payload: CreateCustomerPayload = {
      ...formData,
      age: Number(formData.age),
      woreda: woredaId,
      status: "available",
    };

    createMutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Customer
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Register New Customer</DialogTitle>
          <DialogDescription>
            Enter the customer&lsquo;s details including their 16-digit Fayda
            National ID.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="mb-4 flex items-center rounded-md bg-(--bpds-error-container) p-3 text-(--bpds-on-error-container)">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span className="text-sm">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onValueChange={(value) =>
                  handleSelectChange("gender", value as "male" | "female")
                }
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
            <div className="space-y-2">
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Registering..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
