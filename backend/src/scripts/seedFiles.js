/**
 * سكريبت لحقن بيانات تجريبية لصفحة الملفات والتقارير
 * يُنفَّذ من مجلد /backend:  node src/scripts/seedFiles.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const fs = require('fs');
const { sequelize, Club, User, Player, FileRecord } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const club = await Club.findOne();
    if (!club) { console.log('❌ No club found'); process.exit(1); }

    const user = await User.findOne({ where: { club_id: club.id } });
    const players = await Player.findAll({ where: { club_id: club.id }, limit: 5 });

    // إنشاء مجلد uploads/files إذا لم يوجد
    const uploadDir = path.join(__dirname, '../../uploads/files');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // حذف الملفات القديمة
    await FileRecord.destroy({ where: { club_id: club.id } });

    const sampleFiles = [
      {
        file_name: 'تقرير_الفحص_الطبي_الدوري.pdf',
        file_type: 'report',
        mime_type: 'application/pdf',
        file_size: 2048000,
        description: 'الفحص الطبي الشامل لجميع اللاعبين - الموسم الحالي',
        tags: 'فحص طبي, موسم, شامل',
        is_confidential: false,
        player_id: null,
      },
      {
        file_name: 'MRI_ركبة_يسرى_محمد.jpg',
        file_type: 'mri',
        mime_type: 'image/jpeg',
        file_size: 5120000,
        description: 'صورة رنين مغناطيسي للركبة اليسرى - بعد الإصابة مباشرة',
        tags: 'MRI, ركبة, إصابة',
        is_confidential: true,
        player_id: players[0]?.id || null,
      },
      {
        file_name: 'اشعة_سينية_كاحل.jpg',
        file_type: 'xray',
        mime_type: 'image/jpeg',
        file_size: 1536000,
        description: 'أشعة سينية للكاحل الأيمن للتأكد من عدم وجود كسور',
        tags: 'xray, كاحل, أشعة',
        is_confidential: false,
        player_id: players[1]?.id || null,
      },
      {
        file_name: 'نتائج_التحاليل_المخبرية_2025.pdf',
        file_type: 'lab',
        mime_type: 'application/pdf',
        file_size: 896000,
        description: 'نتائج تحاليل الدم والبول والهرمونات للفريق',
        tags: 'تحاليل, مخبر, دم',
        is_confidential: true,
        player_id: null,
      },
      {
        file_name: 'عقد_عبدالله_العمري.pdf',
        file_type: 'contract',
        mime_type: 'application/pdf',
        file_size: 512000,
        description: 'عقد اللاعب المبرم مع النادي',
        tags: 'عقد, رسمي',
        is_confidential: true,
        player_id: players[2]?.id || null,
      },
      {
        file_name: 'تقرير_تقدم_التأهيل_الشهري.pdf',
        file_type: 'report',
        mime_type: 'application/pdf',
        file_size: 1024000,
        description: 'تقرير التقدم الشهري لجميع برامج التأهيل النشطة',
        tags: 'تأهيل, تقدم, شهري',
        is_confidential: false,
        player_id: null,
      },
      {
        file_name: 'scan_كتف_فهد.jpg',
        file_type: 'scan',
        mime_type: 'image/jpeg',
        file_size: 3072000,
        description: 'مسح ضوئي للكتف الأيمن بعد إصابة التمزق',
        tags: 'scan, كتف, إصابة',
        is_confidential: false,
        player_id: players[3]?.id || null,
      },
      {
        file_name: 'بروتوكول_التغذية_الرياضية.pdf',
        file_type: 'report',
        mime_type: 'application/pdf',
        file_size: 768000,
        description: 'خطة التغذية الرياضية المعتمدة للفريق هذا الموسم',
        tags: 'تغذية, نظام, خطة',
        is_confidential: false,
        player_id: null,
      },
    ];

    // إنشاء الملفات - نحتاج مسارات حقيقية (وهمية في هذه الحالة)
    for (let i = 0; i < sampleFiles.length; i++) {
      const f = sampleFiles[i];
      const fakeFilename = `sample_${i + 1}${f.mime_type === 'application/pdf' ? '.pdf' : '.jpg'}`;
      const fakePath = `/uploads/files/${fakeFilename}`;

      // إنشاء ملف فارغ كبديل وهمي
      const fullPath = path.join(uploadDir, fakeFilename);
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, `Sample file: ${f.file_name}`);
      }

      await FileRecord.create({
        club_id: club.id,
        uploaded_by: user.id,
        file_path: fakePath,
        ...f,
        created_at: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)), // ملفات متفرقة في الأيام الأخيرة
      });

      console.log(`✅ Created file: ${f.file_name}`);
    }

    console.log(`\n🎉 Created ${sampleFiles.length} file records successfully!`);
    console.log('💡 Now refresh the /files page to see the data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
