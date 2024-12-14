const { sendNotification } = require('../bot/telegram-bot');

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
    const bugunTarih = getBugunTarih();
    const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const missingUsers = [];

    // Her kullanıcı için kontrol et
    users.forEach(user => {
        const userKayitlar = tumKayitlar[user.username] || [];
        const bugunKayitVar = userKayitlar.some(kayit => kayit.tarih === bugunTarih);
        
        if (!bugunKayitVar) {
            missingUsers.push(user.username);
        }
    });

    // Eğer veri girmeyen kullanıcı varsa bildirim gönder
    if (missingUsers.length > 0) {
        sendNotification(missingUsers);
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
        setTimeout(() => {
            checkMissingUsers();
            scheduleCheck(); // Sonraki gün için tekrar planla
        }, timeUntilCheck);
    }

    // İlk kontrolü planla
    scheduleCheck();
}

// Uygulamayı başlat
setupDailyCheck(); 