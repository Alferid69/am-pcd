import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/local_notification_service.dart';

class NotificationProvider with ChangeNotifier {
  List<dynamic> _notifications = [];
  final bool _isLoading = false;
  Timer? _timer;

  /// Tracks IDs of notifications that have already been shown as a push,
  /// so we don't re-fire them on every poll cycle.
  final Set<String> _shownIds = {};

  List<dynamic> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount =>
      _notifications.where((n) => n['isRead'] == false).length;

  NotificationProvider() {
    startPolling();
  }

  void startPolling() {
    _timer?.cancel();
    fetchNotifications();
    _timer = Timer.periodic(const Duration(minutes: 1), (_) {
      fetchNotifications();
    });
  }

  void stopPolling() {
    _timer?.cancel();
    _timer = null;
  }

  Future<void> fetchNotifications() async {
    try {
      final response = await ApiService.getNotifications();
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> fetched = data['data'] ?? [];

        // Detect brand-new notifications (not yet seen) to push locally
        for (final n in fetched) {
          final id = n['_id']?.toString() ?? '';
          if (id.isNotEmpty && !_shownIds.contains(id)) {
            // Only push if this isn't the very first load (we don't want a
            // burst of pushes on app start — only push truly new ones).
            if (_shownIds.isNotEmpty) {
              final title = n['title']?.toString() ?? 'New Notification';
              final message = n['message']?.toString() ?? '';
              // Use hashCode of the id as a stable int notification ID
              await LocalNotificationService.showNotification(
                id: id.hashCode.abs(),
                title: title,
                body: message,
              );
            }
            _shownIds.add(id);
          }
        }

        _notifications = fetched;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      final response = await ApiService.markNotificationsAsRead();
      if (response.statusCode == 200) {
        for (var n in _notifications) {
          n['isRead'] = true;
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error marking notifications as read: $e');
    }
  }

  @override
  void dispose() {
    stopPolling();
    super.dispose();
  }
}
