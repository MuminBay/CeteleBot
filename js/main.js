document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('formContainer');
    const ekleBtn = document.getElementById('ekleBtn');
    const listeleBtn = document.getElementById('listeleBtn');
    const kayitListesi = document.getElementById('kayitListesi');
    const listeSection = document.getElementById('liste');
    const formSection = document.getElementById('form');

    let internetTarih = null;

    // İnternet üzerinden tarihi al
    async function getInternetTarih() {
        try {
            const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/Istanbul');
            const data = await response.json();
            const tarih = new Date(data.datetime);
            const gun = String(tarih.getDate()).padStart(2, '0');
            const ay = String(tarih.getMonth() + 1).padStart(2, '0');
            const yil = tarih.getFullYear();
            internetTarih = `${gun}.${ay}.${yil}`;
            return internetTarih;
        } catch (error) {
            console.error('İnternet tarihi alınamadı:', error);
            // İnternet bağlantısı yoksa yerel tarihi kullan
            return getBugunTarih();
        }
    }

    // Yerel tarih (yedek olarak)
    function getBugunTarih() {
        const bugun = new Date();
        const gun = String(bugun.getDate()).padStart(2, '0');
        const ay = String(bugun.getMonth() + 1).padStart(2, '0');
        const yil = bugun.getFullYear();
        return `${gun}.${ay}.${yil}`;
    }

    // Tarihi karşılaştır (tarih1 < tarih2 ise true döner)
    function tarihKarsilastir(tarih1, tarih2) {
        const [gun1, ay1, yil1] = tarih1.split('.');
        const [gun2, ay2, yil2] = tarih2.split('.');
        const d1 = new Date(yil1, ay1 - 1, gun1);
        const d2 = new Date(yil2, ay2 - 1, gun2);
        return d1 < d2;
    }

    // Tüm tarih alanlarını güncelle
    async function tarihleriGuncelle() {
        const bugunTarih = await getInternetTarih();
        const tumTarihAlanlari = formContainer.querySelectorAll('.tarih');
        tumTarihAlanlari.forEach(tarihAlani => {
            if (!tarihAlani.value) { // Eğer tarih alanı boşsa
                tarihAlani.value = bugunTarih;
            }
        });
    }

    // İlk yüklemede tarihi ayarla
    tarihleriGuncelle();

    // Her dakika tarihleri kontrol et ve güncelle
    setInterval(tarihleriGuncelle, 60000); // 60 saniyede bir kontrol et

    // Yeni satır ekle
    ekleBtn.addEventListener('click', async function() {
        const bugunTarih = await getInternetTarih();
        const yeniSatir = document.createElement('div');
        yeniSatir.className = 'form-row';
        yeniSatir.innerHTML = `
            <input type="text" class="tarih" value="${bugunTarih}" readonly>
            <input type="text" placeholder="Yazı" class="yazi">
            <input type="text" placeholder="Cevşen" class="cevsen">
            <input type="text" placeholder="Kuran" class="kuran">
            <input type="text" placeholder="Mütala" class="mutala">
            <input type="text" placeholder="Ezber" class="ezber">
            <button class="sil-btn">Sil</button>
        `;

        formContainer.appendChild(yeniSatir);

        // Silme butonu olayı
        const silBtn = yeniSatir.querySelector('.sil-btn');
        silBtn.addEventListener('click', function() {
            yeniSatir.remove();
        });
    });

    // İlk satırın silme butonu olayı
    const ilkSilBtn = formContainer.querySelector('.sil-btn');
    if (ilkSilBtn) {
        ilkSilBtn.addEventListener('click', function() {
            const satir = this.parentElement;
            satir.remove();
        });
    }

    // Kayıtları listele
    listeleBtn.addEventListener('click', async function() {
        const bugunTarih = await getInternetTarih();
        const kayitlar = [];
        const satirlar = formContainer.querySelectorAll('.form-row');

        satirlar.forEach(satir => {
            const tarihDegeri = satir.querySelector('.tarih').value;
            // Geçmiş tarihli kayıtları engelle
            if (tarihKarsilastir(tarihDegeri, bugunTarih)) {
                alert('Geçmiş tarihli kayıt eklenemez!');
                return;
            }

            const kayit = {
                tarih: tarihDegeri,
                yazi: satir.querySelector('.yazi').value,
                cevsen: satir.querySelector('.cevsen').value,
                kuran: satir.querySelector('.kuran').value,
                mutala: satir.querySelector('.mutala').value,
                ezber: satir.querySelector('.ezber').value
            };

            // Boş kayıtları filtrele
            if (kayit.yazi || kayit.cevsen || kayit.kuran || kayit.mutala || kayit.ezber) {
                kayitlar.push(kayit);
            }
        });

        if (kayitlar.length === 0) {
            alert('Kaydedilecek veri bulunamadı!');
            return;
        }

        // Mevcut kullanıcının kayıtlarını al
        const currentUser = localStorage.getItem('currentUser');
        const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
        
        // Kullanıcının önceki kayıtlarını al veya boş dizi oluştur
        const userKayitlar = tumKayitlar[currentUser] || [];
        
        // Yeni kayıtları ekle
        kayitlar.forEach(kayit => {
            userKayitlar.push(kayit);
        });
        
        // Kayıtları güncelle
        tumKayitlar[currentUser] = userKayitlar;
        localStorage.setItem('kayitlar', JSON.stringify(tumKayitlar));

        // Formu temizle ve yeni tarih ile başlat
        getInternetTarih().then(bugunTarih => {
            formContainer.innerHTML = `
                <div class="form-row">
                    <input type="text" class="tarih" value="${bugunTarih}" readonly>
                    <input type="text" placeholder="Yazı" class="yazi">
                    <input type="text" placeholder="Cevşen" class="cevsen">
                    <input type="text" placeholder="Kuran" class="kuran">
                    <input type="text" placeholder="Mütala" class="mutala">
                    <input type="text" placeholder="Ezber" class="ezber">
                    <button class="sil-btn">Sil</button>
                </div>
            `;

            // Yeni silme butonu olayı
            const yeniSilBtn = formContainer.querySelector('.sil-btn');
            yeniSilBtn.addEventListener('click', function() {
                const satir = this.parentElement;
                satir.remove();
            });
        });

        alert('Kayıtlar başarıyla eklendi!');

        // Kayıtları göster
        kayitlariGoster();
    });

    // Kayıtları göster
    function kayitlariGoster() {
        const currentUser = localStorage.getItem('currentUser');
        const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
        const userKayitlar = tumKayitlar[currentUser] || [];

        if (userKayitlar.length === 0) {
            kayitListesi.innerHTML = '<div class="no-records">Henüz kayıt bulunmamaktadır.</div>';
            return;
        }

        // Tarihe göre sırala (yeniden eskiye)
        userKayitlar.sort((a, b) => {
            const tarihA = a.tarih.split('.').reverse().join('');
            const tarihB = b.tarih.split('.').reverse().join('');
            return tarihB.localeCompare(tarihA);
        });

        let html = `
            <div class="kayit-satir baslik-satir">
                <span>Tarih</span>
                <span>Yazı</span>
                <span>Cevşen</span>
                <span>Kuran</span>
                <span>Mütala</span>
                <span>Ezber</span>
            </div>
        `;

        userKayitlar.forEach(kayit => {
            html += `
                <div class="kayit-satir">
                    <span>${kayit.tarih}</span>
                    <span>${kayit.yazi || '-'}</span>
                    <span>${kayit.cevsen || '-'}</span>
                    <span>${kayit.kuran || '-'}</span>
                    <span>${kayit.mutala || '-'}</span>
                    <span>${kayit.ezber || '-'}</span>
                </div>
            `;
        });

        kayitListesi.innerHTML = html;
        listeSection.classList.remove('gizli');
        formSection.classList.add('gizli');
    }

    // Form linkine tıklanınca
    document.getElementById('formLink').addEventListener('click', function(e) {
        e.preventDefault();
        formSection.classList.remove('gizli');
        listeSection.classList.add('gizli');
    });

    // Liste linkine tıklanınca
    document.getElementById('listeLink').addEventListener('click', function(e) {
        e.preventDefault();
        kayitlariGoster();
    });
}); 