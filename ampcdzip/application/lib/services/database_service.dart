import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'am_pcd_notifications.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE shown_notifications (
            id TEXT PRIMARY KEY
          )
        ''');
      },
    );
  }

  Future<void> addShownNotification(String id) async {
    final db = await database;
    await db.insert(
      'shown_notifications',
      {'id': id},
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
  }

  Future<bool> isNotificationShown(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'shown_notifications',
      where: 'id = ?',
      whereArgs: [id],
    );
    return maps.isNotEmpty;
  }

  Future<Set<String>> getAllShownIds() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('shown_notifications');
    return maps.map((m) => m['id'] as String).toSet();
  }
}
