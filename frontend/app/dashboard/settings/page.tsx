"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { updateProfile, updatePassword } from "../../../api/apiUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";

const roleLabelMap: Record<string, string> = {
  admin: "System Admin",
  bureau: "Trade Bureau",
  zone: "Zone Office",
  woreda: "Woreda Office",
  retailer: "Retailer Cooperative",
};

function FeedbackBanner({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  if (type === "success") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-green-700 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

type UserData = NonNullable<ReturnType<typeof useAuth>["user"]>;

// Inner component: user is guaranteed non-null here, so state initialises from prop directly.
function SettingsForm({ user, userRole, refreshUser }: {
  user: UserData;
  userRole: string;
  refreshUser: () => Promise<void>;
}) {
  // Profile form — initialised once from the prop, no useEffect needed.
  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    username: user.username ?? "",
  });
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await refreshUser();
      setProfileFeedback({ type: "success", message: "Profile updated successfully." });
      setTimeout(() => setProfileFeedback(null), 4000);
    },
    onError: (err: any) => {
      setProfileFeedback({
        type: "error",
        message: err?.response?.data?.message ?? "Failed to update profile.",
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setPasswordForm({ password: "", newPassword: "", confirmNewPassword: "" });
      setPasswordFeedback({ type: "success", message: "Password changed successfully." });
      setTimeout(() => setPasswordFeedback(null), 4000);
    },
    onError: (err: any) => {
      setPasswordFeedback({
        type: "error",
        message: err?.response?.data?.message ?? "Failed to update password.",
      });
    },
  });

  const profileHasChanges =
    profileForm.firstName !== (user.firstName ?? "") ||
    profileForm.lastName  !== (user.lastName  ?? "") ||
    profileForm.username  !== (user.username  ?? "");

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileHasChanges) return;
    setProfileFeedback(null);
    profileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }

    passwordMutation.mutate({
      password: passwordForm.password,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
          <User className="w-6 h-6 text-(--bpds-primary)" /> Settings
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Account Overview */}
      <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--bpds-primary-container) text-(--bpds-primary) text-2xl font-bold select-none">
            {user.firstName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-(--bpds-on-surface) text-lg">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            <div className="mt-1 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              <Badge className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400">
                {roleLabelMap[userRole] ?? userRole}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-(--bpds-primary)" /> Profile Information
          </CardTitle>
          <CardDescription>
            Update your first name, last name, and username. These changes are reflected immediately across the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileFeedback && (
              <FeedbackBanner type={profileFeedback.type} message={profileFeedback.message} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, username: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!profileHasChanges || profileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Form */}
      <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-(--bpds-primary)" /> Change Password
          </CardTitle>
          <CardDescription>
            Enter your current password to authorize the change, then set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordFeedback && (
              <FeedbackBanner type={passwordFeedback.type} message={passwordFeedback.message} />
            )}

            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={passwordMutation.isPending}>
                <Lock className="h-4 w-4 mr-2" />
                {passwordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Outer shell: waits for user to be loaded, then mounts SettingsForm.
// The `key={user._id}` ensures the form re-mounts fresh if the user identity changes.
export default function SettingsPage() {
  const { user, userRole, refreshUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground animate-pulse">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        Unable to load user data. Please refresh the page.
      </div>
    );
  }

  return (
    <SettingsForm
      key={user._id}
      user={user}
      userRole={userRole}
      refreshUser={refreshUser}
    />
  );
}
