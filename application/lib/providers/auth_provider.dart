import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoading = false;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    _tryAutoLogin();
  }

  Future<void> _tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('jwt')) return;

    _token = prefs.getString('jwt');
    final userData = prefs.getString('user');
    if (userData != null) {
      _user = jsonDecode(userData);
    }
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.login(username, password);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['status'] == 'success') {
        _token = data['token'];
        _user = data['data']['user'];

        if (_user!['role'] != 'retailer') {
          throw Exception('Only retailers can access this application');
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt', _token!);
        await prefs.setString('user', jsonEncode(_user));

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw Exception(data['message'] ?? 'Login failed');
      }
    } on Exception catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      throw Exception('Connection failed. Please check your server.');
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt');
    await prefs.remove('user');
    notifyListeners();
  }
}
