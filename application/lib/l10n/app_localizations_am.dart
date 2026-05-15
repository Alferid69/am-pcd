// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Amharic (`am`).
class AppLocalizationsAm extends AppLocalizations {
  AppLocalizationsAm([String locale = 'am']) : super(locale);

  @override
  String get welcomeBack => 'እንኳን ደህና መጡ';

  @override
  String get signInToManage => 'የእርስዎን የህብረት ሥራ ማህበር ለማስተዳደር ይግቡ';

  @override
  String get username => 'የተጠቃሚ ስም';

  @override
  String get password => 'የይለፍ ቃል';

  @override
  String get signIn => 'ይግቡ';

  @override
  String get enterUsername => 'የተጠቃሚ ስም ያስገቡ';

  @override
  String get enterPassword => 'የይለፍ ቃል ያስገቡ';

  @override
  String get passwordTooShort => 'የይለፍ ቃል በጣም አጭር ነው';

  @override
  String get inventory => 'ክምችት';

  @override
  String get sales => 'ሽያጮች';

  @override
  String get requests => 'ጥያቄዎች';

  @override
  String get alerts => 'ማንቂያዎች';

  @override
  String get overview => 'አጠቃላይ እይታ';

  @override
  String get salesHistory => 'የሽያጭ ታሪክ';

  @override
  String get stockRequests => 'የክምችት ጥያቄዎች';

  @override
  String get notifications => 'ማሳወቂያዎች';

  @override
  String get logout => 'ይውጡ';

  @override
  String get scanQRCode => 'የQR ኮድ ይቃኙ';

  @override
  String get completeSale => 'ሽያጩን ያጠናቅቁ';

  @override
  String get customerDetails => 'የደንበኛ ዝርዝሮች';

  @override
  String get name => 'ስም';

  @override
  String get faydaId => 'ፋይዳ መለያ';

  @override
  String get woreda => 'ወረዳ';

  @override
  String get transactionDetails => 'የግብይት ዝርዝሮች';

  @override
  String get commodity => 'ምርት';

  @override
  String get quantity => 'ብዛት';

  @override
  String get selectCommodity => 'ምርት ይምረጡ';

  @override
  String get saleCompleted => 'ሽያጩ በተሳካ ሁኔታ ተጠናቅቋል!';

  @override
  String get transactionFailed => 'ግብይቱ አልተሳካም';

  @override
  String get markAllAsRead => 'ሁሉንም እንደተነበቡ ምልክት ያድርጉ';

  @override
  String get noNotifications => 'ምንም ማሳወቂያዎች የሉም';

  @override
  String get newRequest => 'አዲስ ጥያቄ';

  @override
  String get createStockRequest => 'የክምችት ጥያቄ ይፍጠሩ';

  @override
  String get addAnotherCommodity => 'ሌላ ምርት ይጨምሩ';

  @override
  String get submit => 'ይላኩ';

  @override
  String get cancel => 'ሰርዝ';

  @override
  String get status => 'ሁኔታ';

  @override
  String get timeline => 'የጊዜ መስመር';

  @override
  String get amount => 'መጠን';

  @override
  String get search => 'ፈልግ';

  @override
  String get language => 'ቋንቋ';

  @override
  String get english => 'እንግሊዝኛ';

  @override
  String get amharic => 'አማርኛ';

  @override
  String get loading => 'በመጫን ላይ...';

  @override
  String get currentInventory => 'ያለው ክምችት';

  @override
  String get items => 'ምርቶች';

  @override
  String get noStockAvailable => 'ምንም ክምችት የለም';

  @override
  String get retailer => 'ቸርቻሪ';

  @override
  String get requestTimeline => 'የጥያቄ የጊዜ መስመር';

  @override
  String get noStockRequestsFound => 'ምንም የክምችት ጥያቄዎች አልተገኙም';

  @override
  String get noSalesRecordsFound => 'ምንም የሽያጭ መዝገቦች አልተገኙም';

  @override
  String get makeSale => 'ሽያጭ ያከናውኑ';

  @override
  String maxAllowedPerCustomer(Object amount, Object unit) {
    return 'ለአንድ ደንበኛ የሚፈቀደው ከፍተኛ መጠን፦ $amount $unit';
  }

  @override
  String exceedsQuota(Object max, Object unit) {
    return 'ብዛቱ ለደንበኛ ከተፈቀደው መጠን በላይ ነው ($max $unit)';
  }

  @override
  String get centerFaydaQR => 'የፋይዳ መለያ QR በሳጥኑ ውስጥ ያድርጉ';

  @override
  String get onlyRetailerAccess => 'ይህ መተግበሪያ ለቸርቻሪዎች ብቻ የተፈቀደ ነው።';

  @override
  String get exitApp => 'መተግበሪያውን ዝጋ';
}
