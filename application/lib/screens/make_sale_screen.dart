import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class MakeSaleScreen extends StatefulWidget {
  final String faydaId;

  const MakeSaleScreen({super.key, required this.faydaId});

  @override
  State<MakeSaleScreen> createState() => _MakeSaleScreenState();
}

class _MakeSaleScreenState extends State<MakeSaleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController(text: '1');
  
  Map<String, dynamic>? _customer;
  List<dynamic> _availableCommodities = [];
  String? _selectedCommodityId;
  
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchInitialData();
  }

  Future<void> _fetchInitialData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = Provider.of<AuthProvider>(context, listen: false).user;
      final retailerId = user?['worksAt'];

      // Parallel fetch
      final results = await Future.wait([
        ApiService.getCustomerByFayda(widget.faydaId),
        if (retailerId != null) ApiService.getRetailerData(retailerId),
      ]);

      final customerRes = results[0];
      final customerData = jsonDecode(customerRes.body);
      
      if (customerRes.statusCode == 200) {
        setState(() => _customer = customerData['data']['customer']);
      } else {
        setState(() => _errorMessage = customerData['message'] ?? 'Customer not found');
      }

      if (results.length > 1) {
        final retailerRes = results[1];
        final retailerData = jsonDecode(retailerRes.body);
        if (retailerRes.statusCode == 200) {
          setState(() {
            _availableCommodities = retailerData['data']['availableCommodity'] ?? [];
          });
        }
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to load data. Please try again.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitSale() async {
    if (!_formKey.currentState!.validate() || _selectedCommodityId == null) return;

    setState(() => _isSubmitting = true);
    try {
      final response = await ApiService.createTransaction({
        'customerFayda': widget.faydaId,
        'commodity': _selectedCommodityId,
        'amount': double.tryParse(_quantityController.text) ?? 1.0,
      });

      final data = jsonDecode(response.body);
      if (response.statusCode == 201 || data['status'] == 'success') {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Sale completed successfully!'), backgroundColor: Colors.green),
          );
          Navigator.pop(context, true); // Return true to refresh history
        }
      } else {
        setState(() => _errorMessage = data['message'] ?? 'Transaction failed');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Network error. Please try again.');
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedCommodity = _availableCommodities.find(
      (c) => c['commodity']['_id'] == _selectedCommodityId,
    );
    final unit = selectedCommodity?['commodity']?['baseUnit'] ?? '';

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Complete Sale'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_errorMessage != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 24),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50.withOpacity(isDark ? 0.1 : 1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.shade100.withOpacity(isDark ? 0.2 : 1)),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.alertCircle, color: Colors.red, size: 20),
                            const SizedBox(width: 12),
                            Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 13))),
                          ],
                        ),
                      ),

                    // Customer Info Section
                    Text(
                      'Customer Details', 
                      style: TextStyle(
                        fontWeight: FontWeight.bold, 
                        fontSize: 16,
                        color: Theme.of(context).colorScheme.onSurface,
                      )
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardTheme.color,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
                      ),
                      child: Column(
                        children: [
                          _InfoRow(label: 'Name', value: '${_customer?['firstName'] ?? '...'} ${_customer?['lastName'] ?? ''}'),
                          Divider(height: 24, color: isDark ? Colors.white10 : Colors.grey.shade100),
                          _InfoRow(label: 'Fayda ID', value: widget.faydaId),
                          Divider(height: 24, color: isDark ? Colors.white10 : Colors.grey.shade100),
                          _InfoRow(label: 'Woreda', value: _customer?['woreda']?['name'] ?? '...'),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),
                    Text(
                      'Transaction Details', 
                      style: TextStyle(
                        fontWeight: FontWeight.bold, 
                        fontSize: 16,
                        color: Theme.of(context).colorScheme.onSurface,
                      )
                    ),
                    const SizedBox(height: 16),

                    // Commodity Selection
                    Text(
                      'Commodity', 
                      style: TextStyle(
                        fontSize: 14, 
                        fontWeight: FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
                      )
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _selectedCommodityId,
                      hint: Text('Select a commodity', style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.4))),
                      dropdownColor: Theme.of(context).cardTheme.color,
                      style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade50,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12), 
                          borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.grey.shade200),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12), 
                          borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.grey.shade200),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                      items: _availableCommodities.map<DropdownMenuItem<String>>((c) {
                        return DropdownMenuItem<String>(
                          value: c['commodity']['_id'],
                          child: Text('${c['commodity']['name']} (${c['quantity']} available)'),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => _selectedCommodityId = val),
                    ),

                    const SizedBox(height: 24),

                    // Quantity
                    Text(
                      'Quantity ${unit.isNotEmpty ? "($unit)" : ""}', 
                      style: TextStyle(
                        fontSize: 14, 
                        fontWeight: FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
                      )
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _quantityController,
                      keyboardType: TextInputType.number,
                      style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade50,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12), 
                          borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.grey.shade200),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12), 
                          borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.grey.shade200),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) return 'Enter quantity';
                        if (double.tryParse(val) == null) return 'Enter a valid number';
                        return null;
                      },
                    ),

                    const SizedBox(height: 48),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isSubmitting || _customer == null ? null : _submitSale,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).primaryColor,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                          disabledBackgroundColor: Theme.of(context).primaryColor.withOpacity(0.5),
                        ),
                        child: _isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Complete Sale', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: isDark ? Colors.white60 : Colors.grey.shade600, fontSize: 13)),
        Text(value, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Theme.of(context).colorScheme.onSurface)),
      ],
    );
  }
}

extension ListFind<T> on List<T> {
  T? find(bool Function(T) test) {
    try {
      return firstWhere(test);
    } catch (e) {
      return null;
    }
  }
}
