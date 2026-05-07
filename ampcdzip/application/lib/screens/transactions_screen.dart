import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:application/l10n/app_localizations.dart';
import '../services/api_service.dart';
import 'scanner_screen.dart';
import 'make_sale_screen.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  List<dynamic> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTransactions();
  }

  Future<void> _fetchTransactions() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.getTransactions();
      if (!mounted) return;
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        setState(() => _transactions = data['data']);
      }
    } catch (e) {
      debugPrint('Error fetching transactions: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: _fetchTransactions,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _transactions.isEmpty
                ? ListView(
                    children: [
                      SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                      Center(
                        child: Column(
                          children: [
                            Icon(LucideIcons.receipt, size: 64, color: Theme.of(context).disabledColor.withOpacity(0.1)),
                            const SizedBox(height: 16),
                            Text(l10n.noSalesRecordsFound, style: TextStyle(color: Theme.of(context).disabledColor)),
                          ],
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _transactions.length,
                    itemBuilder: (context, index) {
                      final tx = _transactions[index];
                      final date = DateTime.parse(tx['createdAt']);
                      final formattedDate = DateFormat('MMM d, yyyy • h:mm a').format(date);
                      
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: CircleAvatar(
                            backgroundColor: isDark ? const Color(0xFF6366F1).withOpacity(0.2) : const Color(0xFF4F46E5).withOpacity(0.1),
                            child: Icon(
                              LucideIcons.user, 
                              color: isDark ? const Color(0xFF818CF8) : const Color(0xFF4F46E5), 
                              size: 18
                            ),
                          ),
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  '${tx['customer']?['firstName'] ?? 'Unknown'} ${tx['customer']?['lastName'] ?? ''}',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                              Text(
                                '${tx['amount']} ${tx['commodity']?['baseUnit'] ?? ''}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).primaryColor,
                                ),
                              ),
                            ],
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(
                                tx['commodity']?['name'] ?? 'Unknown Commodity',
                                style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                formattedDate,
                                style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.4), fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push<String>(
            context,
            MaterialPageRoute(builder: (context) => const ScannerScreen()),
          );

          if (result != null && mounted) {
            // Navigate to Make Sale Form
            final success = await Navigator.push<bool>(
              context,
              MaterialPageRoute(
                builder: (context) => MakeSaleScreen(faydaId: result),
              ),
            );

            if (success == true) {
              _fetchTransactions(); // Refresh list after sale
            }
          }
        },
        label: Text(l10n.makeSale),
        icon: const Icon(LucideIcons.plus, color: Colors.white),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
    );
  }
}
