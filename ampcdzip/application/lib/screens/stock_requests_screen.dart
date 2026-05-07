import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:application/l10n/app_localizations.dart';
import '../services/api_service.dart';
import '../widgets/new_request_dialog.dart';

class StockRequestsScreen extends StatefulWidget {
  const StockRequestsScreen({super.key});

  @override
  State<StockRequestsScreen> createState() => _StockRequestsScreenState();
}

class _StockRequestsScreenState extends State<StockRequestsScreen> {
  List<dynamic> _requests = [];
  bool _isLoading = true;
  List<dynamic> _commodities = [];

  @override
  void initState() {
    super.initState();
    _fetchRequests();
    _fetchCommodities();
  }

  Future<void> _fetchRequests() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.getStockRequests();
      if (!mounted) return;
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        setState(() => _requests = data['data']);
      }
    } catch (e) {
      debugPrint('Error fetching requests: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _fetchCommodities() async {
    try {
      final response = await ApiService.getCommodities();
      if (!mounted) return;
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        setState(() => _commodities = data['data'] ?? []);
      }
    } catch (e) {
      debugPrint('Error fetching commodities: $e');
    }
  }

  // Compute commodity IDs that are already pending in existing requests
  Set<String> _alreadyPendingCommodityIds() {
    final pendingStatuses = ['PENDING_WOREDA', 'PENDING_ZONE', 'PENDING_BUREAU'];
    final ids = <String>{};
    for (var req in _requests) {
      if (pendingStatuses.contains(req['status'])) {
        final items = req['requestedItems'] as List? ?? [];
        for (var item in items) {
          final id = item['commodity']?['_id'];
          if (id != null) ids.add(id as String);
        }
      }
    }
    return ids;
  }

  Future<void> _openNewRequestDialog() async {
    final blockedIds = _alreadyPendingCommodityIds();
    final bool? shouldRefresh = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => NewRequestDialog(
        commodities: _commodities,
        blockedIds: blockedIds,
      ),
    );

    if (shouldRefresh == true && mounted) {
      _fetchRequests();
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING_WOREDA':
      case 'PENDING_ZONE':
      case 'PENDING_BUREAU':
        return Colors.orange;
      case 'APPROVED':
        return Colors.green;
      case 'FULFILLED':
        return Colors.blue;
      case 'REJECTED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildTimeline(BuildContext context, List<dynamic> timeline) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            l10n.requestTimeline,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
        ...timeline.asMap().entries.map((entry) {
          final index = entry.key;
          final event = entry.value;
          final isLast = index == timeline.length - 1;
          final timestamp = DateTime.parse(event['timestamp']);
          final formattedTime = DateFormat('MMM d, h:mm a').format(timestamp);
          
          Color dotColor = Colors.blue;
          if (event['action'] == 'REJECTED') dotColor = Colors.red;
          if (event['action'] == 'APPROVED') dotColor = Colors.green;
          if (event['action'] == 'SUBMITTED') dotColor = Colors.indigo;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: IntrinsicHeight(
              child: Row(
                children: [
                  Column(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: dotColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      if (!isLast)
                        Expanded(
                          child: Container(
                            width: 2,
                            color: Colors.grey.withOpacity(0.3),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${event['action']} by ${event['role']}',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                        ),
                        Text(
                          formattedTime,
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                        ),
                        if (event['remarks'] != null && event['remarks'].toString().isNotEmpty)
                          Container(
                            margin: const EdgeInsets.only(top: 4, bottom: 12),
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.grey.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey.withOpacity(0.1)),
                            ),
                            child: Text(
                              '"${event['remarks']}"',
                              style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic),
                            ),
                          )
                        else
                          const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  String _getStatusText(String status) {
    return status.replaceAll('_', ' ');
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: _fetchRequests,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _requests.isEmpty
                ? ListView(
                    children: [
                      SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                      Center(
                        child: Column(
                          children: [
                            Icon(LucideIcons.package, size: 64, color: Theme.of(context).disabledColor.withOpacity(0.1)),
                            const SizedBox(height: 16),
                            Text(l10n.noStockRequestsFound, style: TextStyle(color: Theme.of(context).disabledColor)),
                          ],
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _requests.length,
                    itemBuilder: (context, index) {
                      final req = _requests[index];
                      final date = DateTime.parse(req['createdAt']);
                      final formattedDate = DateFormat('MMM d, yyyy').format(date);
                      final items = req['requestedItems'] as List;
                      final statusColor = _getStatusColor(req['status']);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ExpansionTile(
                          shape: const RoundedRectangleBorder(side: BorderSide.none),
                          collapsedIconColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
                          iconColor: Theme.of(context).primaryColor,
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  '${l10n.requests} #${req['_id'].toString().substring(req['_id'].toString().length - 6).toUpperCase()}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).colorScheme.onSurface,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  _getStatusText(req['status']),
                                  style: TextStyle(
                                    color: statusColor,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          subtitle: Text(
                            '$formattedDate • ${items.length} ${l10n.items}',
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                          ),
                          children: [
                            const Divider(height: 1),
                            ...items.map((item) => ListTile(
                                  dense: true,
                                  leading: Icon(
                                    LucideIcons.dot, 
                                    size: 12, 
                                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5)
                                  ),
                                  title: Text(item['commodity']?['name'] ?? 'Unknown'),
                                  trailing: Text(
                                    '${item['quantity']} ${item['unit']}',
                                    style: const TextStyle(fontWeight: FontWeight.w600),
                                  ),
                                )),
                            if (req['timeline'] != null && (req['timeline'] as List).isNotEmpty) ...[
                              const Divider(height: 1),
                              _buildTimeline(context, req['timeline'] as List),
                            ],
                            const SizedBox(height: 16),
                          ],
                        ),
                      );
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openNewRequestDialog,
        label: Text(l10n.newRequest),
        icon: const Icon(LucideIcons.plus, color: Colors.white),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
    );
  }
}
