import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:application/l10n/app_localizations.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isScanned = false;

  void _onDetect(BarcodeCapture capture) {
    if (_isScanned) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final String? code = barcode.rawValue;
      if (code != null) {
        // Regex to find exactly 16 consecutive digits
        final RegExp regExp = RegExp(r'\d{16}');
        final match = regExp.firstMatch(code);

        if (match != null) {
          final String faydaId = match.group(0)!;
          setState(() => _isScanned = true);
          _controller.stop();
          
          if (mounted) {
            Navigator.pop(context, faydaId);
          }
          return;
        }
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.scanQRCode),
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: _controller,
              builder: (context, state, child) {
                switch (state.torchState) {
                  case TorchState.off:
                    return const Icon(LucideIcons.zapOff, size: 20);
                  case TorchState.on:
                    return const Icon(LucideIcons.zap, size: 20, color: Colors.yellow);
                  default:
                    return const Icon(LucideIcons.zapOff, size: 20);
                }
              },
            ),
            onPressed: () => _controller.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCcw, size: 20),
            onPressed: () => _controller.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),
          // Scanner Overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: 0,
                    left: 0,
                    child: _CornerIcon(angle: 0),
                  ),
                  Positioned(
                    top: 0,
                    right: 0,
                    child: _CornerIcon(angle: 90),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    child: _CornerIcon(angle: 270),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: _CornerIcon(angle: 180),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Text(
                  l10n.centerFaydaQR,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CornerIcon extends StatelessWidget {
  final double angle;
  const _CornerIcon({required this.angle});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: angle * 3.14159 / 180,
      child: Container(
        width: 40,
        height: 40,
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: Color(0xFF2563EB), width: 4),
            left: BorderSide(color: Color(0xFF2563EB), width: 4),
          ),
        ),
      ),
    );
  }
}
