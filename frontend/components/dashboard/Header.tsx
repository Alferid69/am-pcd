import {
  Bell,
  CircleUserRound,
  Languages,
  Menu,
  Moon,
  Sun,
  Check,
  CheckCircle2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useT } from "next-i18next/client";
import {
  fetchUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "../../api/apiNotifications";

type DashboardHeaderProps = {
  welcomeLabel: string;
  heading: string;
  openMenuLabel: string;
  toggleLanguageLabel: string;
  toggleThemeLabel: string;
  notificationsLabel: string;
  userName: string;
  roleLabel: string;
  notificationCount?: number; // kept for backwards compatibility but unused
  languageLabel: string;
  isDarkTheme: boolean;
  onOpenMenu: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
};

export default function DashboardHeader({
  welcomeLabel,
  heading,
  openMenuLabel,
  toggleLanguageLabel,
  toggleThemeLabel,
  notificationsLabel,
  userName,
  roleLabel,
  languageLabel,
  isDarkTheme,
  onOpenMenu,
  onToggleLanguage,
  onToggleTheme,
}: DashboardHeaderProps) {
  const { t } = useT("common");
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchUnreadNotifications,
    refetchInterval: 15000, // Poll every 15s
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-(--bpds-outline-variant) bg-(--bpds-surface)/95 px-4 py-3 backdrop-blur-md md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) text-(--bpds-on-surface) md:hidden"
            onClick={onOpenMenu}
            aria-label={openMenuLabel}
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-(--bpds-on-surface-variant)">
              {welcomeLabel}
            </p>
            <h2 className="text-xl font-semibold leading-7 text-(--bpds-on-surface)">
              {heading}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg border border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) px-3 text-sm font-semibold text-(--bpds-on-surface)"
            aria-label={toggleLanguageLabel}
          >
            <Languages
              className="h-4.5 w-4.5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>{languageLabel}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) text-(--bpds-on-surface)"
            aria-label={toggleThemeLabel}
          >
            {isDarkTheme ? (
              <Sun
                className="h-4.5 w-4.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ) : (
              <Moon
                className="h-4.5 w-4.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={notificationsLabel}
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--bpds-outline-variant) text-(--bpds-on-surface) transition-colors ${showNotifications ? "bg-(--bpds-surface-variant)" : "bg-(--bpds-surface-container-lowest)"}`}
            >
              <Bell
                className="h-4.75 w-4.75"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-(--bpds-error) px-1 text-[11px] font-semibold text-(--bpds-on-error)">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-(--bpds-outline-variant) bg-(--bpds-surface) shadow-(--bpds-shadow-level-3) overflow-hidden z-50">
                <div className="bg-(--bpds-surface-container-low) px-4 py-3 border-b border-(--bpds-outline-variant) flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <h3 className="font-semibold text-(--bpds-on-surface)">
                      {t("dashboard.notifications")}
                    </h3>
                    <span className="text-xs font-semibold bg-(--bpds-error) text-(--bpds-on-error) px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="text-xs flex items-center gap-1 text-(--bpds-primary) hover:underline"
                      disabled={markAllAsReadMutation.isPending}
                    >
                      <CheckCircle2 className="w-3 h-3" />{" "}
                      {t("common.markAllRead", {
                        defaultValue: "Mark all read",
                      })}
                    </button>
                  )}
                </div>
                <div className="max-h-75 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {t("common.noNotifications", {
                        defaultValue: "No new notifications",
                      })}
                    </div>
                  ) : (
                    <ul className="divide-y divide-(--bpds-outline-variant)">
                      {notifications.map((notif) => (
                        <li
                          key={notif._id}
                          className="p-4 hover:bg-(--bpds-surface-container-lowest) transition-colors flex gap-3 items-start group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-(--bpds-on-surface) font-medium leading-snug">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(notif.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => markAsReadMutation.mutate(notif._id)}
                            className="shrink-0 p-1.5 rounded-full bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-green-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title={t("common.markAsRead", {
                              defaultValue: "Mark as read",
                            })}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <span
            aria-hidden="true"
            className="hidden h-7 w-px bg-(--bpds-outline-variant) md:block"
          />

          <div className="hidden items-center gap-2 rounded-lg border border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) px-3 py-2 md:flex">
            <div>
              <p className="text-sm text-right font-semibold leading-4 text-(--bpds-on-surface)">
                {userName}
              </p>
              <p className="text-xs text-right text-(--bpds-primary)">
                {roleLabel || t("dashboard.roles.admin")}
              </p>
            </div>
            <CircleUserRound
              className="h-5 w-5 text-(--bpds-on-surface-variant)"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
