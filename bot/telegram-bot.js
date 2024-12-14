const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const schedule = require('node-schedule');

// Bot token'ı
const token = '8023340251:AAHByRXvVygh_IXb8V7Q4B_dbAhHysNFJY0';

// Bot oluştur
const bot = new TelegramBot(token, {polling: true});

// Yönetici chat ID'lerini sakla
let adminChatIds = [];
const ADMIN_FILE = 'data/admins.json';
const USERS_FILE = 'data/users.json';
const RECORDS_FILE = 'data/records.json';

// Veri klasörünü oluştur
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Dosyaları oluştur veya oku
try {
    if (fs.existsSync(ADMIN_FILE)) {
        adminChatIds = JSON.parse(fs.readFileSync(ADMIN_FILE));
    } else {
        fs.writeFileSync(ADMIN_FILE, '[]');
    }
} catch (error) {
    console.error('Admin dosyası okuma hatası:', error);
}

// /start komutu
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.sendMessage(chatId, 'Hoş geldiniz! Bu bot, her gün saat 23:30\'da veri girişi yapmayan kullanıcıları otomatik olarak kontrol eder ve bildirim gönderir.');
        
        // Yönetici chat ID'sini kaydet
        if (!adminChatIds.includes(chatId)) {
            adminChatIds.push(chatId);
            fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminChatIds));
            console.log(`Yeni yönetici eklendi: ${chatId}`);
            await bot.sendMessage(chatId, 'Yönetici olarak kaydedildiniz. Artık günlük veri girişi raporlarını otomatik olarak alacaksınız.');
        }
    } catch (error) {
        console.error('Bot mesaj gönderme hatası:', error);
    }
});

// Bildirim gönderme fonksiyonu
async function sendNotification(missingUsers) {
    const bugunTarih = new Date().toLocaleDateString('tr-TR');
    const message = `📊 Veri Girişi Raporu (${bugunTarih})\n\n` +
                   `❌ Bugün veri girişi yapmayan kullanıcılar:\n\n` +
                   missingUsers.map(username => `• ${username}`).join('\n') + 
                   `\n\nToplam ${missingUsers.length} kullanıcı veri girişi yapmamış.`;
    
    if (adminChatIds.length === 0) {
        console.error('Hiç yönetici kaydedilmemiş!');
        return;
    }

    let basarili = false;
    // Tüm yöneticilere bildirim gönder
    for (const chatId of adminChatIds) {
        try {
            await bot.sendMessage(chatId, message);
            console.log(`Bildirim gönderildi: ${chatId}`);
            basarili = true;
        } catch (error) {
            console.error(`Mesaj gönderilemedi (${chatId}):`, error);
        }
    }

    if (!basarili) {
        throw new Error('Hiçbir yöneticiye bildirim gönderilemedi!');
    }
}

// Kullanıcı kontrolü yapan fonksiyon
async function checkUsers() {
    console.log('Kullanıcı kontrolü başlatıldı');
    try {
        // Kullanıcıları ve kayıtları dosyadan oku
        const users = JSON.parse(fs.readFileSync('data/users.json', 'utf8')) || [];
        const tumKayitlar = JSON.parse(fs.readFileSync('data/records.json', 'utf8')) || {};
        const bugunTarih = new Date().toLocaleDateString('tr-TR');
        const missingUsers = [];

        // Her kullanıcı için kontrol et
        users.forEach(user => {
            const userKayitlar = tumKayitlar[user.username] || [];
            const bugunKayitVar = userKayitlar.some(kayit => kayit.tarih === bugunTarih);
            
            if (!bugunKayitVar) {
                missingUsers.push(user.username);
            }
        });

        if (missingUsers.length > 0) {
            await sendNotification(missingUsers);
            console.log('Günlük kontrol tamamlandı ve bildirimler gönderildi');
        } else {
            console.log('Tüm kullanıcılar veri girişi yapmış');
        }
    } catch (error) {
        console.error('Kontrol sırasında hata:', error);
    }
}

// Her gün saat 23:15'te kontrol başlat, 23:30'da bildirim gönder
let kontrolEdilmisKullanicilar = [];

// Saat 23:15'te kontrol yap
schedule.scheduleJob('15 23 * * *', async () => {
    console.log('23:15 Kontrolü başlatıldı');
    try {
        const users = JSON.parse(fs.readFileSync('data/users.json', 'utf8')) || [];
        const tumKayitlar = JSON.parse(fs.readFileSync('data/records.json', 'utf8')) || {};
        const bugunTarih = new Date().toLocaleDateString('tr-TR');
        
        kontrolEdilmisKullanicilar = [];

        users.forEach(user => {
            const userKayitlar = tumKayitlar[user.username] || [];
            const bugunKayitVar = userKayitlar.some(kayit => kayit.tarih === bugunTarih);
            
            if (!bugunKayitVar) {
                kontrolEdilmisKullanicilar.push(user.username);
            }
        });

        console.log('23:15 Kontrolü tamamlandı, veri girmeyen kullanıcılar belirlendi');
    } catch (error) {
        console.error('23:15 Kontrolü sırasında hata:', error);
    }
});

// Saat 23:30'da bildirim gönder
schedule.scheduleJob('30 23 * * *', async () => {
    console.log('23:30 Bildirimi başlatıldı');
    if (kontrolEdilmisKullanicilar.length > 0) {
        try {
            await sendNotification(kontrolEdilmisKullanicilar);
            console.log('23:30 Bildirimi başarıyla gönderildi');
        } catch (error) {
            console.error('23:30 Bildirimi gönderilirken hata:', error);
        }
    } else {
        console.log('Bildirim gönderilecek kullanıcı yok');
    }
    // Kontrol listesini temizle
    kontrolEdilmisKullanicilar = [];
});

console.log('Bot başlatıldı ve zamanlanmış görevler ayarlandı (23:15 kontrol, 23:30 bildirim)');

process.on('SIGINT', () => {
    console.log('Bot kapatılıyor...');
    process.exit();
});

module.exports = {
    sendNotification,
    checkUsers
}; 