import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:application/l10n/app_localizations.dart';
import 'transactions_screen.dart';
import 'stock_requests_screen.dart';
import 'inventory_screen.dart';
import 'notifications_screen.dart';
import '../providers/theme_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/locale_provider.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const InventoryScreen(),
    const TransactionsScreen(),
    const StockRequestsScreen(),
    const NotificationsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final localeProvider = Provider.of<LocaleProvider>(context);
    final isDark = themeProvider.themeMode == ThemeMode.dark;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectedIndex == 0 ? 'AM-PCD' : _getTitle(context, _selectedIndex)),
        actions: [
          DropdownButton<Locale>(
            value: localeProvider.locale,
            underline: const SizedBox(),
            icon: Icon(LucideIcons.languages, size: 20, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)),
            items: [
              DropdownMenuItem(
                value: const Locale('en'),
                child: Text(l10n.english, style: const TextStyle(fontSize: 14)),
              ),
              DropdownMenuItem(
                value: const Locale('am'),
                child: Text(l10n.amharic, style: const TextStyle(fontSize: 14)),
              ),
            ],
            onChanged: (Locale? newLocale) {
              if (localeProvider.locale != newLocale && newLocale != null) {
                localeProvider.setLocale(newLocale);
              }
            },
          ),
          IconButton(
            onPressed: () => themeProvider.toggleTheme(),
            icon: Icon(
              isDark ? LucideIcons.sun : LucideIcons.moon,
              size: 20,
            ),
          ),
          IconButton(
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout(),
            icon: const Icon(
              LucideIcons.logOut,
              size: 20,
              color: Colors.red,
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          border: Border(
            top: BorderSide(color: isDark ? Colors.white10 : Colors.grey.shade200),
          ),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) => setState(() => _selectedIndex = index),
          backgroundColor: Theme.of(context).cardTheme.color,
          indicatorColor: Theme.of(context).primaryColor.withOpacity(0.1),
          destinations:  [
            NavigationDestination(
              icon: const Icon(LucideIcons.layoutDashboard),
              label: l10n.overview,
            ),
            NavigationDestination(
              icon: const Icon(LucideIcons.receipt),
              label: l10n.sales,
            ),
            NavigationDestination(
              icon: const Icon(LucideIcons.package),
              label: l10n.requests,
            ),
            NavigationDestination(
              icon: Consumer<NotificationProvider>(
                builder: (context, np, _) => Badge(
                  label: Text(np.unreadCount.toString()),
                  isLabelVisible: np.unreadCount > 0,
                  child: const Icon(LucideIcons.bell),
                ),
              ),
              label: l10n.alerts,
            ),
          ],
        ),
      ),
    );
  }

  String _getTitle(BuildContext context, int index) {
    final l10n = AppLocalizations.of(context)!;
    switch (index) {
      case 0:
        return l10n.overview;
      case 1:
        return l10n.salesHistory;
      case 2:
        return l10n.stockRequests;
      case 3:
        return l10n.notifications;
      default:
        return 'AM-PCD';
    }
  }
}
