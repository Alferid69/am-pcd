import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.getNotifications();
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        setState(() => _notifications = data['data']);
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      final response = await ApiService.markNotificationsAsRead();
      if (response.statusCode == 200) {
        _fetchNotifications();
      }
    } catch (e) {
      debugPrint('Error marking notifications as read: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: _fetchNotifications,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  if (_notifications.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton.icon(
                            onPressed: _markAllAsRead,
                            icon: const Icon(LucideIcons.checkCheck, size: 16),
                            label: const Text('Mark all as read', style: TextStyle(fontSize: 12)),
                          ),
                        ],
                      ),
                    ),
                  Expanded(
                    child: _notifications.isEmpty
                        ? ListView(
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                              Center(
                                child: Column(
                                  children: [
                                    Icon(LucideIcons.bellOff, size: 64, color: Theme.of(context).disabledColor.withOpacity(0.1)),
                                    const SizedBox(height: 16),
                                    Text('No notifications', style: TextStyle(color: Theme.of(context).disabledColor)),
                                  ],
                                ),
                              ),
                            ],
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _notifications.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final notification = _notifications[index];
                              final isRead = notification['isRead'] ?? false;
                              final date = DateTime.parse(notification['createdAt']);
                              final timeAgo = _getTimeAgo(date);

                              return Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isRead 
                                      ? Theme.of(context).cardTheme.color 
                                      : Theme.of(context).colorScheme.primary.withOpacity(isDark ? 0.15 : 0.05),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isRead 
                                        ? Theme.of(context).dividerColor.withOpacity(0.1) 
                                        : Theme.of(context).colorScheme.primary.withOpacity(0.2),
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: isRead 
                                            ? Colors.grey.withOpacity(0.1) 
                                            : (isDark ? const Color(0xFF6366F1).withOpacity(0.2) : const Color(0xFF4F46E5).withOpacity(0.1)),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        LucideIcons.bell,
                                        size: 18,
                                        color: isRead ? Colors.grey : (isDark ? const Color(0xFF818CF8) : const Color(0xFF4F46E5)),
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            notification['title'] ?? 'Notification',
                                            style: TextStyle(
                                              fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                                              fontSize: 15,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            notification['message'] ?? '',
                                            style: TextStyle(
                                              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                                              fontSize: 13,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            timeAgo,
                                            style: TextStyle(
                                              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (!isRead)
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          color: Theme.of(context).primaryColor,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
      ),
    );
  }

  String _getTimeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) return '${difference.inDays}d ago';
    if (difference.inHours > 0) return '${difference.inHours}h ago';
    if (difference.inMinutes > 0) return '${difference.inMinutes}m ago';
    return 'Just now';
  }
}
