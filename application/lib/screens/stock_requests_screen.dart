import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class StockRequestsScreen extends StatefulWidget {
  const StockRequestsScreen({super.key});

  @override
  State<StockRequestsScreen> createState() => _StockRequestsScreenState();
}

class _StockRequestsScreenState extends State<StockRequestsScreen> {
  List<dynamic> _requests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.getStockRequests();
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        setState(() => _requests = data['data']);
      }
    } catch (e) {
      debugPrint('Error fetching requests: $e');
    } finally {
      setState(() => _isLoading = false);
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

  String _getStatusText(String status) {
    return status.replaceAll('_', ' ');
  }

  @override
  Widget build(BuildContext context) {
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
                            Text('No stock requests found', style: TextStyle(color: Theme.of(context).disabledColor)),
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
                                  'Request #${req['_id'].toString().substring(req['_id'].toString().length - 6).toUpperCase()}',
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
                            '$formattedDate • ${items.length} items',
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
                            const SizedBox(height: 8),
                          ],
                        ),
                      );
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Implement New Request Dialog
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('New Request functionality coming soon!')),
          );
        },
        label: const Text('New Request'),
        icon: const Icon(LucideIcons.plus, color: Colors.white),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
    );
  }
}
