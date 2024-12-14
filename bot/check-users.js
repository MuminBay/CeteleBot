const { sendNotification, readJsonFile, USERS_FILE, RECORDS_FILE } = require('./telegram-bot');

// Bugünün tarihini al (GG.AA.YYYY formatında)
function getBugunTarih() {
    const bugun = new Date();
    const gun = String(bugun.getDate()).padStart(2, '0');
    const ay = String(bugun.getMonth() + 1).padStart(2, '0');
    const yil = bugun.getFullYear();
    return `${gun}.${ay}.${yil}`;
}

// Veri girmeyen kullanıcıları kontrol et
function checkMissingUsers() {
    try {
        const bugunTarih = getBugunTarih();
        const tumKayitlar = readJsonFile(RECORDS_FILE);
        const users = readJsonFile(USERS_FILE);
        const missingUsers = [];

        // Her kullanıcı için kontrol et
        Object.keys(users).forEach(username => {
            const userKayitlar = tumKayitlar[username] || [];
            const bugunKayitVar = userKayitlar.some(kayit => kayit.tarih === bugunTarih);
            
            if (!bugunKayitVar) {
                missingUsers.push(username);
            }
        });

        // Eğer veri girmeyen kullanıcı varsa bildirim gönder
        if (missingUsers.length > 0) {
            console.log('Veri girmeyen kullanıcılar:', missingUsers);
            sendNotification(missingUsers);
        } else {
            console.log('Tüm kullanıcılar veri girişi yapmış.');
        }
    } catch (error) {
        console.error('Kontrol sırasında hata:', error);
    }
}

// Her gün 23:30'da kontrol et
function setupDailyCheck() {
    function scheduleCheck() {
        const now = new Date();
        const scheduledTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23, // Saat
            30  // Dakika
        );

        // Eğer belirlenen saat geçtiyse, sonraki güne ayarla
        if (now > scheduledTime) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilCheck = scheduledTime - now;
        console.log(`Bir sonraki kontrol ${Math.floor(timeUntilCheck / (1000 * 60))} dakika sonra yapılacak.`);
        
        setTimeout(() => {
            console.log('Günlük kontrol yapılıyor...');
            checkMissingUsers();
            scheduleCheck(); // Sonraki gün için tekrar planla
        }, timeUntilCheck);
    }

    // İlk kontrolü planla
    console.log('Bot başlatıldı, kontrol planlanıyor...');
    scheduleCheck();
}

// Test amaçlı hemen kontrol
console.log('İlk kontrol yapılıyor...');
checkMissingUsers();

// Uygulamayı başlat
setupDailyCheck(); 