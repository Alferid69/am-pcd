import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:application/l10n/app_localizations.dart';
import '../services/api_service.dart';

class NewRequestDialog extends StatefulWidget {
  final List<dynamic> commodities;
  final Set<String> blockedIds;

  const NewRequestDialog({
    super.key,
    required this.commodities,
    required this.blockedIds,
  });

  @override
  State<NewRequestDialog> createState() => _NewRequestDialogState();
}

class _NewRequestDialogState extends State<NewRequestDialog> {
  List<Map<String, dynamic>> newItems = [
    {'commodity': null, 'quantity': 1, 'unit': null},
  ];
  String? errorMsg;
  bool isSubmitting = false;

  void addItem() {
    setState(() {
      newItems.add({'commodity': null, 'quantity': 1, 'unit': null});
    });
  }

  void removeItem(int idx) {
    setState(() {
      newItems.removeAt(idx);
    });
  }

  Future<void> submit() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() {
      isSubmitting = true;
      errorMsg = null;
    });

    final validItems = newItems
        .where((i) =>
            i['commodity'] != null && i['quantity'] > 0 && i['unit'] != null)
        .toList();

    if (validItems.isEmpty) {
      setState(() {
        errorMsg = 'Please add at least one valid item.';
        isSubmitting = false;
      });
      return;
    }

    try {
      final payload = {
        'requestedItems': validItems
            .map((i) => {
                  'commodity': i['commodity'],
                  'quantity': i['quantity'],
                  'unit': i['unit'],
                })
            .toList()
      };

      final response = await ApiService.createStockRequest(payload);

      if (!mounted) return;

      if (response.statusCode == 201) {
        Navigator.of(context).pop(true); // Return true on success
      } else {
        final respData = jsonDecode(response.body);
        setState(() {
          errorMsg = respData['message'] ?? 'Failed to create request.';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMsg = 'Error: $e';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return AlertDialog(
      title: Text(l10n.createStockRequest),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ...newItems.asMap().entries.map((entry) {
              final idx = entry.key;
              final item = entry.value;
              final selectedCommodityId = item['commodity'] as String?;
              final selectedCommodity = widget.commodities.firstWhere(
                  (c) => c['_id'] == selectedCommodityId,
                  orElse: () => null);
              final unitOptions = selectedCommodity != null
                  ? [
                      selectedCommodity['baseUnit'],
                      selectedCommodity['bulkUnit']
                    ]
                  : [];
              return Column(
                children: [
                  Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: selectedCommodityId,
                              hint: Text(l10n.selectCommodity),
                              items: widget.commodities
                                  .map<DropdownMenuItem<String>>((c) {
                                final id = c['_id'] as String;
                                final disabled = widget.blockedIds.contains(id) &&
                                    id != selectedCommodityId;
                                return DropdownMenuItem<String>(
                                  value: id,
                                  enabled: !disabled,
                                  child: Text(
                                    c['name'] + (disabled ? ' (Pending)' : ''),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) {
                                setState(() {
                                  item['commodity'] = val;
                                  item['unit'] = null; // reset unit when commodity changes
                                });
                              },
                            ),
                          ),
                          if (newItems.length > 1)
                            IconButton(
                              icon: const Icon(Icons.remove_circle,
                                  color: Colors.red),
                              onPressed: () => removeItem(idx),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          SizedBox(
                            width: 100,
                            child: TextFormField(
                              initialValue: item['quantity'].toString(),
                              decoration: InputDecoration(
                                labelText: l10n.quantity,
                                contentPadding:
                                    const EdgeInsets.symmetric(horizontal: 4),
                              ),
                              keyboardType: TextInputType.number,
                              onChanged: (v) {
                                setState(() {
                                  item['quantity'] = int.tryParse(v) ?? 1;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: item['unit'] as String?,
                              hint: const Text('Unit'),
                              items: unitOptions
                                  .map<DropdownMenuItem<String>>((u) {
                                return DropdownMenuItem<String>(
                                    value: u, child: Text(u));
                              }).toList(),
                              onChanged: selectedCommodityId == null
                                  ? null
                                  : (val) {
                                      setState(() {
                                        item['unit'] = val;
                                      });
                                    },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(),
                ],
              );
            }).toList(),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                icon: const Icon(Icons.add),
                label: Text(l10n.addAnotherCommodity),
                onPressed: addItem,
              ),
            ),
            if (errorMsg != null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Text(errorMsg!, style: const TextStyle(color: Colors.red)),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: isSubmitting ? null : () => Navigator.of(context).pop(false),
          child: Text(l10n.cancel),
        ),
        ElevatedButton(
          onPressed: isSubmitting ? null : submit,
          child: isSubmitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.white))
              : Text(l10n.submit),
        ),
      ],
    );
  }
}
