import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Use 10.0.2.2 for Android Emulator to access localhost
  // Change to your machine's IP if testing on physical device
  // static const String baseUrl = 'http://10.0.2.2:3000/api/v1';
  // static const String baseUrl = 'http://10.144.37.219:3000/api/v1';
  static const String baseUrl = 'https://d271-51-20-63-138.ngrok-free.app/api/v1';
  static Function()? onUnauthorized;

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt');
  }

  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static http.Response _handleResponse(http.Response response) {
    if (response.statusCode == 401) {
      onUnauthorized?.call();
    }
    return response;
  }

  // Auth
  static Future<http.Response> login(String username, String password) async {
    return _handleResponse(await http.post(
      Uri.parse('$baseUrl/users/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    ).timeout(const Duration(seconds: 10)));
  }

  // Stock Requests
  static Future<http.Response> getStockRequests() async {
    final headers = await getHeaders();
    return _handleResponse(await http.get(Uri.parse('$baseUrl/stockRequests'), headers: headers));
  }

  static Future<http.Response> createStockRequest(Map<String, dynamic> data) async {
    final headers = await getHeaders();
    return _handleResponse(await http.post(
      Uri.parse('$baseUrl/stockRequests'),
      headers: headers,
      body: jsonEncode(data),
    ));
  }

  // Transactions (Sales)
  static Future<http.Response> getTransactions() async {
    final headers = await getHeaders();
    return _handleResponse(await http.get(Uri.parse('$baseUrl/transactions'), headers: headers));
  }

  static Future<http.Response> createTransaction(Map<String, dynamic> data) async {
    final headers = await getHeaders();
    return _handleResponse(await http.post(
      Uri.parse('$baseUrl/transactions'),
      headers: headers,
      body: jsonEncode(data),
    ));
  }

  // Retailer Info (Inventory)
  static Future<http.Response> getMe() async {
    final headers = await getHeaders();
    return _handleResponse(await http.get(Uri.parse('$baseUrl/users/me'), headers: headers));
  }

  static Future<http.Response> getRetailerData(String id) async {
    final headers = await getHeaders();
    return _handleResponse(await http.get(Uri.parse('$baseUrl/retailerCooperatives/$id'), headers: headers));
  }
  
  static Future<http.Response> getCommodities() async {
    final headers = await getHeaders();
    return _handleResponse(await http.get(Uri.parse('$baseUrl/commodities'), headers: headers));
  }

  static Future<http.Response> getCustomerByFayda(String fayda) async {
    final headers = await getHeaders();
    return _handleResponse(await http.get(Uri.parse('$baseUrl/customers/fayda/$fayda'), headers: headers));
  }

  static Future<http.Response> getNotifications() async {
    final headers = await getHeaders();
    return _handleResponse(await http.get(Uri.parse('$baseUrl/notifications'), headers: headers));
  }

  static Future<http.Response> markNotificationsAsRead() async {
    final headers = await getHeaders();
    return _handleResponse(await http.patch(
      Uri.parse('$baseUrl/notifications/markAllAsRead'),
      headers: headers,
    ));
  }
}
