/**
 * seedSupplies.js
 * ==========================================
 * بيانات تجريبية شاملة للمستلزمات والأدوية
 * تشمل: أدوية، موضعيات، مكملات، مستهلكات، ومعاملات مخزون متعددة
 * ==========================================
 * الاستخدام: node backend/src/scripts/seedSupplies.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const {
  sequelize,
  Club,
  User,
  Player,
  Supply,
  SupplyTransaction,
} = require('../models');

const now = new Date();
const daysAgo = (d) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - d);
  return dt;
};
const daysFromNow = (d) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
};

async function seedSupplies() {
  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بنجاح.');

    const club = await Club.findOne();
    if (!club) {
      console.log('❌ لا يوجد نادٍ. أنشئ نادياً أولاً.');
      process.exit(1);
    }
    const clubId = club.id;

    const user = await User.findOne({ where: { club_id: clubId } });
    if (!user) {
      console.log('❌ لا يوجد مستخدم مرتبط بالنادي.');
      process.exit(1);
    }

    const players = await Player.findAll({ where: { club_id: clubId }, limit: 5 });

    // ==========================================
    // مسح البيانات القديمة
    // ==========================================
    console.log('🧹 مسح البيانات القديمة...');
    await SupplyTransaction.destroy({ where: { club_id: clubId } });
    await Supply.destroy({ where: { club_id: clubId } });

    // ==========================================
    // إنشاء المستلزمات
    // ==========================================
    console.log('💊 إضافة الأدوية والمستلزمات...');

    const suppliesData = [
      // ======= أدوية =======
      {
        club_id: clubId,
        name: 'باراسيتامول 500mg (بنادول)',
        category: 'medication',
        unit: 'حبة',
        total_quantity: 200,
        used_quantity: 45,
        reorder_level: 50,
        expiry_date: daysFromNow(365),
        storage_location: 'خزانة الأدوية - الرف العلوي',
        purpose: 'تخفيف الألم وخفض الحرارة',
        manufacturer: 'GlaxoSmithKline',
        barcode: '6281003552215',
        is_controlled_substance: false,
        requires_prescription: false,
        notes: 'الجرعة القصوى 4 حبات يومياً',
      },
      {
        club_id: clubId,
        name: 'إيبوبروفين 400mg',
        category: 'medication',
        unit: 'حبة',
        total_quantity: 8,
        used_quantity: 42,
        reorder_level: 30,
        expiry_date: daysFromNow(180),
        storage_location: 'خزانة الأدوية - الرف العلوي',
        purpose: 'مضاد للالتهابات ومسكن للآلام',
        manufacturer: 'Sanofi',
        is_controlled_substance: false,
        requires_prescription: false,
        notes: 'يؤخذ مع الطعام',
      },
      {
        club_id: clubId,
        name: 'أميتريبتيلين 25mg',
        category: 'medication',
        unit: 'علبة',
        total_quantity: 3,
        used_quantity: 2,
        reorder_level: 5,
        expiry_date: daysFromNow(270),
        storage_location: 'خزانة الأدوية المقفلة',
        purpose: 'علاج الألم المزمن العصبي',
        manufacturer: 'Pfizer',
        is_controlled_substance: true,
        requires_prescription: true,
        notes: 'مادة خاضعة للرقابة - يُحفظ في الخزانة المقفلة',
      },
      {
        club_id: clubId,
        name: 'ديكلوفيناك بوتاسيوم 50mg',
        category: 'medication',
        unit: 'حبة',
        total_quantity: 0,
        used_quantity: 60,
        reorder_level: 20,
        expiry_date: daysFromNow(-15), // منتهي الصلاحية
        storage_location: 'خزانة الأدوية - الرف الأوسط',
        purpose: 'مسكن للآلام ومضاد للالتهابات',
        manufacturer: 'Novartis',
        is_controlled_substance: false,
        requires_prescription: true,
        notes: 'منتهي الصلاحية - يحتاج إتلاف',
      },
      // ======= موضعيات =======
      {
        club_id: clubId,
        name: 'فولتارين جل 1% (ديكلوفيناك)',
        category: 'topical',
        unit: 'أنبوبة 100جم',
        total_quantity: 18,
        used_quantity: 12,
        reorder_level: 5,
        expiry_date: daysFromNow(25), // ينتهي قريباً
        storage_location: 'درج العلاج الطبيعي',
        purpose: 'تخفيف الآلام والالتهابات الموضعية',
        manufacturer: 'Novartis',
        is_controlled_substance: false,
        requires_prescription: false,
      },
      {
        club_id: clubId,
        name: 'كريم هيدروكورتيزون 1%',
        category: 'topical',
        unit: 'أنبوبة 50جم',
        total_quantity: 12,
        used_quantity: 8,
        reorder_level: 3,
        expiry_date: daysFromNow(200),
        storage_location: 'درج العلاج الطبيعي',
        purpose: 'علاج الالتهابات الجلدية الموضعية',
        manufacturer: 'GlaxoSmithKline',
        requires_prescription: false,
      },
      {
        club_id: clubId,
        name: 'رذاذ تبريد Biofreeze',
        category: 'topical',
        unit: 'علبة رذاذ',
        total_quantity: 4,
        used_quantity: 6,
        reorder_level: 3,
        expiry_date: daysFromNow(400),
        storage_location: 'حقيبة الإسعاف الميدانية',
        purpose: 'تهدئة الألم الحاد فوراً في الملعب',
        manufacturer: 'Performance Health',
      },
      // ======= مكملات غذائية =======
      {
        club_id: clubId,
        name: 'بروتين مصل الحليب (Whey Protein)',
        category: 'supplement',
        unit: 'كيلو',
        total_quantity: 6,
        used_quantity: 4,
        reorder_level: 2,
        expiry_date: daysFromNow(150),
        storage_location: 'مخزن التغذية الرياضية',
        purpose: 'دعم بناء العضلات وسرعة التعافي',
        manufacturer: 'Optimum Nutrition',
      },
      {
        club_id: clubId,
        name: 'مغنيسيوم 400mg',
        category: 'supplement',
        unit: 'علبة 60 حبة',
        total_quantity: 10,
        used_quantity: 5,
        reorder_level: 2,
        expiry_date: daysFromNow(300),
        storage_location: 'مخزن التغذية الرياضية',
        purpose: 'منع التقلصات وتحسين جودة النوم',
        manufacturer: 'Solgar',
      },
      {
        club_id: clubId,
        name: 'فيتامين D3 (5000 IU)',
        category: 'supplement',
        unit: 'علبة 90 حبة',
        total_quantity: 5,
        used_quantity: 10,
        reorder_level: 2,
        expiry_date: daysFromNow(500),
        storage_location: 'مخزن التغذية الرياضية',
        purpose: 'صحة العظام والمناعة',
        manufacturer: 'Solgar',
      },
      // ======= مستهلكات طبية =======
      {
        club_id: clubId,
        name: 'شريط لاصق رياضي كينيسيو (Kinesio Tape)',
        category: 'consumable',
        unit: 'لفة',
        total_quantity: 5,
        used_quantity: 15,
        reorder_level: 20,
        storage_location: 'خزانة المستهلكات - رف 2',
        purpose: 'دعم العضلات والمفاصل وتقليل الألم',
        manufacturer: 'KT Tape',
      },
      {
        club_id: clubId,
        name: 'ضمادات شبكية مرنة (Crepe Bandage) 10cm',
        category: 'consumable',
        unit: 'رباط',
        total_quantity: 25,
        used_quantity: 30,
        reorder_level: 15,
        storage_location: 'خزانة المستهلكات - رف 1',
        purpose: 'تثبيت وضغط الكاحل والمفاصل',
        manufacturer: 'BSN Medical',
      },
      {
        club_id: clubId,
        name: 'قفازات لاتكس طبية (صندوق)',
        category: 'consumable',
        unit: 'صندوق 100 قطعة',
        total_quantity: 3,
        used_quantity: 7,
        reorder_level: 2,
        storage_location: 'خزانة المستهلكات - رف 1',
        purpose: 'الحماية من العدوى أثناء الفحص والعلاج',
        manufacturer: 'Kimberly-Clark',
      },
      {
        club_id: clubId,
        name: 'حقن دكسامي 2ml (Dexamethasone)',
        category: 'medication',
        unit: 'أمبول',
        total_quantity: 10,
        reorder_level: 5,
        expiry_date: daysFromNow(365),
        storage_location: 'الثلاجة الطبية',
        purpose: 'علاج الالتهابات الحادة والتفاعلات التحسسية',
        manufacturer: 'Pharco',
        is_controlled_substance: false,
        requires_prescription: true,
      },
      {
        club_id: clubId,
        name: 'محلول ملحي فيزيولوجي 0.9% (250ml)',
        category: 'consumable',
        unit: 'كيس',
        total_quantity: 20,
        reorder_level: 5,
        storage_location: 'رف الطوارئ',
        purpose: 'غسيل الجروح وترطيب العيون والترطيب الوريدي',
      },
      // ======= مستهلكات معدات =======
      {
        club_id: clubId,
        name: 'جل التوصيل للموجات فوق الصوتية',
        category: 'equipment_consumable',
        unit: 'زجاجة 250ml',
        total_quantity: 8,
        reorder_level: 3,
        storage_location: 'طاولة جهاز الألتراساوند',
        purpose: 'موصل لجهاز الموجات فوق الصوتية العلاجية',
        manufacturer: 'Parker Labs',
      },
      {
        club_id: clubId,
        name: 'أقطاب TENS الاستبدالية (مزدوجة)',
        category: 'equipment_consumable',
        unit: 'زوج',
        total_quantity: 2,
        reorder_level: 5,
        storage_location: 'درج جهاز التحفيز الكهربائي',
        purpose: 'أقطاب جهاز TENS للتحفيز العصبي الكهربائي',
      },
    ];

    const createdSupplies = await Supply.bulkCreate(suppliesData);
    console.log(`✅ تمت إضافة ${createdSupplies.length} مستلزم.`);

    // ==========================================
    // معاملات مخزون تاريخية
    // ==========================================
    console.log('📋 إضافة معاملات المخزون...');

    const transactions = [];
    const playerId0 = players[0]?.id || null;
    const playerId1 = players[1]?.id || null;
    const suppByName = (name) => createdSupplies.find((s) => s.name.includes(name));

    const paracetamol = suppByName('باراسيتامول');
    const ibuprofen = suppByName('إيبوبروفين');
    const voltaren = suppByName('فولتارين');
    const kinesio = suppByName('كينيسيو');
    const whey = suppByName('بروتين');

    if (paracetamol) {
      // 5 معاملات صرف و 2 إضافة مخزون
      for (let i = 5; i >= 1; i--) {
        transactions.push({
          club_id: clubId,
          supply_id: paracetamol.id,
          player_id: i % 2 === 0 ? playerId0 : playerId1,
          performed_by: user.id,
          transaction_type: 'dispense',
          quantity_change: -(4 + i),
          remaining_after: 200 - (4 + i) * i,
          notes: `صرف للاعب بعد إصابة تدريبية - الجلسة ${i}`,
          transaction_at: daysAgo(i * 3),
        });
      }
      transactions.push({
        club_id: clubId,
        supply_id: paracetamol.id,
        performed_by: user.id,
        transaction_type: 'restock',
        quantity_change: 100,
        remaining_after: 200,
        notes: 'استلام شحنة من الصيدلية المركزية',
        transaction_at: daysAgo(20),
      });
    }

    if (ibuprofen) {
      transactions.push({
        club_id: clubId,
        supply_id: ibuprofen.id,
        player_id: playerId0,
        performed_by: user.id,
        transaction_type: 'dispense',
        quantity_change: -10,
        remaining_after: 40,
        notes: 'صرف بعد إصابة عضلية في التدريب',
        transaction_at: daysAgo(7),
      });
      transactions.push({
        club_id: clubId,
        supply_id: ibuprofen.id,
        player_id: playerId1,
        performed_by: user.id,
        transaction_type: 'dispense',
        quantity_change: -12,
        remaining_after: 28,
        notes: 'صرف بعد التواء كاحل',
        transaction_at: daysAgo(3),
      });
    }

    if (voltaren) {
      transactions.push({
        club_id: clubId,
        supply_id: voltaren.id,
        player_id: playerId0,
        performed_by: user.id,
        transaction_type: 'dispense',
        quantity_change: -2,
        remaining_after: 18,
        notes: 'جلسة علاج طبيعي - تطبيق موضعي',
        transaction_at: daysAgo(2),
      });
    }

    if (kinesio) {
      transactions.push({
        club_id: clubId,
        supply_id: kinesio.id,
        performed_by: user.id,
        transaction_type: 'restock',
        quantity_change: 20,
        remaining_after: 25,
        notes: 'شراء من المتجر الرياضي',
        transaction_at: daysAgo(30),
      });
      for (let i = 4; i >= 1; i--) {
        transactions.push({
          club_id: clubId,
          supply_id: kinesio.id,
          player_id: i % 2 === 0 ? playerId0 : playerId1,
          performed_by: user.id,
          transaction_type: 'dispense',
          quantity_change: -i,
          remaining_after: 25 - i * 4,
          notes: 'تثبيت مفصل الكاحل قبل المباراة',
          transaction_at: daysAgo(i * 5),
        });
      }
    }

    if (whey) {
      transactions.push({
        club_id: clubId,
        supply_id: whey.id,
        performed_by: user.id,
        transaction_type: 'restock',
        quantity_change: 10,
        remaining_after: 10,
        notes: 'طلب شهري من موردنا الرياضي',
        transaction_at: daysAgo(45),
      });
      transactions.push({
        club_id: clubId,
        supply_id: whey.id,
        player_id: playerId0,
        performed_by: user.id,
        transaction_type: 'dispense',
        quantity_change: -4,
        remaining_after: 6,
        notes: 'توزيع على اللاعبين في برنامج التغذية',
        transaction_at: daysAgo(15),
      });
    }

    await SupplyTransaction.bulkCreate(transactions);
    console.log(`✅ تمت إضافة ${transactions.length} معاملة مخزون.`);

    console.log('\n🎉 اكتملت عملية التهيئة بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 أصناف المستلزمات: ${createdSupplies.length}`);
    console.log(`📋 معاملات المخزون: ${transactions.length}`);
    console.log(`⚠️  مستلزمات منخفضة المخزون: ${createdSupplies.filter((s) => s.total_quantity <= s.reorder_level).length}`);
    console.log(`🔴 منتهية الصلاحية: ${createdSupplies.filter((s) => s.expiry_date && new Date(s.expiry_date) < now).length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ أثناء التهيئة:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedSupplies();
