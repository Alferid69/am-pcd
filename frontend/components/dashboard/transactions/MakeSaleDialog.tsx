"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, AlertCircle } from "lucide-react";
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
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { fetchRetailerById } from "../../../api/apiRetailers";
import { createTransaction } from "../../../api/apiTransactions";
import { useAuth } from "../../../contexts/AuthContext";

export default function MakeSaleDialog() {
  const { worksAt: retailerId } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerFayda: "",
    commodity: "",
    amount: "1",
  });

  const { data: retailer } = useQuery({
    queryKey: ["retailer", retailerId],
    queryFn: () => fetchRetailerById(retailerId!),
    enabled: !!retailerId && isOpen,
  });

  const availableCommodities = retailer?.availableCommodity || [];
  const selectedCommodity = availableCommodities.find(
    (ac: any) => ac.commodity._id === formData.commodity
  );
  const selectedUnit = selectedCommodity?.commodity?.baseUnit || "";

  const transactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["retailer"] });
      setIsOpen(false);
      setSubmitError(null);
      setFormData({ customerFayda: "", commodity: "", amount: "1" });
    },
    onError: (err: any) => {
      setSubmitError(
        err?.response?.data?.message ?? "Transaction failed. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.customerFayda || !formData.commodity || !formData.amount) {
      setSubmitError("Please fill out all fields.");
      return;
    }

    if (formData.customerFayda.length !== 16) {
      setSubmitError("Fayda number must be exactly 16 digits.");
      return;
    }

    transactionMutation.mutate({
      customerFayda: formData.customerFayda,
      commodity: formData.commodity,
      amount: Number(formData.amount),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all"
          />
        }
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Make a Sale
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Sale</DialogTitle>
          <DialogDescription>
            Enter the customer&apos;s Fayda ID and select the commodity.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="mb-4 flex items-center rounded-md bg-red-50 border border-red-200 p-3 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerFayda">Customer Fayda ID (16 digits)</Label>
            <Input
              id="customerFayda"
              placeholder="e.g. 1234567890123456"
              value={formData.customerFayda}
              onChange={(e) =>
                setFormData({ ...formData, customerFayda: e.target.value })
              }
              maxLength={16}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commodity">Commodity</Label>
            <Select
              value={formData.commodity}
              onValueChange={(value) =>
                setFormData({ ...formData, commodity: value ?? "" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select commodity">
                  {selectedCommodity?.commodity.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableCommodities.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No commodities available
                  </SelectItem>
                ) : (
                  availableCommodities.map((ac: any) => (
                    <SelectItem
                      key={ac.commodity._id}
                      value={ac.commodity._id}
                      disabled={ac.quantity <= 0}
                    >
                      {ac.commodity.name} ({ac.quantity} {ac.commodity.baseUnit} available) - {ac.commodity.price} ETB
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Quantity {selectedUnit ? `(${selectedUnit})` : ""}
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={transactionMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={transactionMutation.isPending}>
              {transactionMutation.isPending ? "Processing..." : "Complete Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
