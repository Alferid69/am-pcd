import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'transactions_screen.dart';
import 'stock_requests_screen.dart';
import 'inventory_screen.dart';
import 'notifications_screen.dart';
import '../providers/theme_provider.dart';
import '../providers/auth_provider.dart';

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
    final isDark = themeProvider.themeMode == ThemeMode.dark;
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectedIndex == 0 ? 'AM-PCD' : _getTitle(_selectedIndex)),
        actions: [
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
          destinations: const [
            NavigationDestination(
              icon: Icon(LucideIcons.layoutDashboard),
              label: 'Overview',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.receipt),
              label: 'Sales',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.package),
              label: 'Requests',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.bell),
              label: 'Alerts',
            ),
          ],
        ),
      ),
    );
  }

  String _getTitle(int index) {
    switch (index) {
      case 0:
        return 'Overview';
      case 1:
        return 'Sales History';
      case 2:
        return 'Stock Requests';
      case 3:
        return 'Notifications';
      default:
        return 'AM-PCD';
    }
  }
}
