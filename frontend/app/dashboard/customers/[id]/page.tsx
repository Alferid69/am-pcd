"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ArrowLeft, User, Phone, MapPin, Hash, CheckCircle2, XCircle, FileText, Calendar } from "lucide-react";
import apiClient from "../../../../lib/api";
import { Customer } from "../../../../components/dashboard/types";
import { Badge } from "../../../../components/ui/badge";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await apiClient.get(`/customers/${params.id}`);
        setCustomer(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch customer details.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) fetchCustomer();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground animate-pulse">Loading details...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error || "Customer not found."}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-3">
            <User className="h-8 w-8 text-(--bpds-primary)" />
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Hash className="h-4 w-4" /> Fayda ID: {customer.fayda}
          </p>
        </div>
        <div>
          {customer.status === "available" ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 text-sm">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Haven&apos;t bought monthly allowance yet
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 px-3 py-1 text-sm">
              <XCircle className="w-4 h-4 mr-1.5" /> Already bought monthly allowance
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">First Name</p>
                <p className="text-(--bpds-on-surface)">{customer.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Last Name</p>
                <p className="text-(--bpds-on-surface)">{customer.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Gender</p>
                <p className="text-(--bpds-on-surface) capitalize">{customer.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Age</p>
                <p className="text-(--bpds-on-surface)">{customer.age} years</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" /> Contact & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </p>
              <p className="text-(--bpds-on-surface)">{customer.phone}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Kebele</p>
                <p className="text-(--bpds-on-surface)">{customer.kebele || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">House Number</p>
                <p className="text-(--bpds-on-surface)">{customer.houseNumber || "N/A"}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Registration Date
              </p>
              <p className="text-(--bpds-on-surface)">
                {customer.createdAt ? format(new Date(customer.createdAt), "MMMM do, yyyy 'at' h:mm a") : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
