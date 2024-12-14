document.addEventListener('DOMContentLoaded', function() {
    const userList = document.getElementById('userList');
    const userRecords = document.getElementById('userRecords');
    const recordsList = document.getElementById('recordsList');
    const backToUsers = document.getElementById('backToUsers');
    const usersSection = document.getElementById('users');
    const settingsSection = document.getElementById('settings');
    const usersLink = document.getElementById('usersLink');
    const settingsLink = document.getElementById('settingsLink');
    const adminPasswordForm = document.getElementById('adminPasswordForm');

    // Yönetici kontrolü
    const currentUser = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Yönetici değilse ana sayfaya yönlendir
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    // Kullanıcı bilgilerini txt dosyasına kaydet
    function saveUsersTxt() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const ADMIN_USERS = JSON.parse(localStorage.getItem('adminUsers')) || [];
        const date = new Date().toLocaleString('tr-TR');

        let content = `TÜM KULLANICILAR LİSTESİ (${date})\n`;
        content += "================================\n\n";
        
        content += "YÖNETİCİLER:\n";
        content += "===========\n\n";
        
        ADMIN_USERS.forEach(admin => {
            content += `Kullanıcı Adı: ${admin.username}\n`;
            content += `Şifre: ${admin.password}\n`;
            content += "-------------------\n";
        });

        content += "\nKULLANICILAR:\n";
        content += "===========\n\n";

        users.forEach(user => {
            content += `Kullanıcı Adı: ${user.username}\n`;
            content += `Şifre: ${user.password}\n`;
            content += "-------------------\n";
        });

        // Dosyayı oluştur ve indir
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kullanici_listesi_${date.replace(/[/:]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Yeni şifre değişikliğini txt'ye kaydet
    function appendPasswordChangeToTxt(username, newPassword) {
        const date = new Date().toLocaleString('tr-TR');
        let content = `\nŞİFRE DEĞİŞİKLİĞİ (${date}):\n`;
        content += `Kullanıcı Adı: ${username}\n`;
        content += `Yeni Şifre: ${newPassword}\n`;
        content += "-------------------\n";

        // Dosyayı oluştur ve indir
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sifre_degisikligi.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Menü geçişleri
    usersLink.addEventListener('click', function(e) {
        e.preventDefault();
        usersSection.classList.remove('gizli');
        userRecords.classList.add('gizli');
        settingsSection.classList.add('gizli');
        usersLink.classList.add('active');
        settingsLink.classList.remove('active');
    });

    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        settingsSection.classList.remove('gizli');
        usersSection.classList.add('gizli');
        userRecords.classList.add('gizli');
        settingsLink.classList.add('active');
        usersLink.classList.remove('active');
    });

    // Kullanıcıları listele
    function showUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const ADMIN_USERS = JSON.parse(localStorage.getItem('adminUsers')) || [];
        const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
        let html = '<h2>Kayıtlı Kullanıcılar</h2>';

        // Yönetici listesi
        html += '<div class="admin-section">';
        html += '<h3>Yöneticiler</h3>';
        html += `
            <div class="user-list-header">
                <span>Kullanıcı Adı</span>
                <span>İşlemler</span>
            </div>
        `;

        ADMIN_USERS.forEach(admin => {
            // Mevcut giriş yapmış yöneticiyi gösterme
            if (admin.username !== currentUser) {
                html += `
                    <div class="user-item">
                        <span class="username">${admin.username}</span>
                        <span class="user-actions">
                            <button class="delete-btn" data-username="${admin.username}" data-type="admin">Sil</button>
                        </span>
                    </div>
                `;
            }
        });
        html += '</div>';

        // Normal kullanıcı listesi
        html += '<div class="users-section">';
        html += '<h3>Normal Kullanıcılar</h3>';
        html += `
            <div class="user-list-header">
                <span>Kullanıcı Adı</span>
                <span>Ad Soyad</span>
                <span>Telefon</span>
                <span>İşlemler</span>
            </div>
        `;

        users.forEach(user => {
            const userContact = contacts[user.username] || {};
            html += `
                <div class="user-item" data-username="${user.username}">
                    <span class="username">${user.username}</span>
                    <span>${userContact.fullName || '-'}</span>
                    <span>${userContact.phone ? '+90' + userContact.phone : '-'}</span>
                    <span class="user-actions">
                        <button class="view-btn" data-username="${user.username}">Kayıtları Gör</button>
                        <button class="delete-btn" data-username="${user.username}" data-type="user">Sil</button>
                    </span>
                </div>
            `;
        });
        html += '</div>';

        // Kullanıcı bilgilerini indir butonu
        html += `
            <div class="admin-actions">
                <button id="saveUsersBtn" class="action-btn">Kullanıcı Bilgilerini İndir</button>
            </div>
        `;

        userList.innerHTML = html;

        // İndirme butonu olayı
        const saveUsersBtn = document.getElementById('saveUsersBtn');
        saveUsersBtn.addEventListener('click', saveUsersTxt);

        // Silme butonları için olay dinleyicileri
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.dataset.username;
                const userType = this.dataset.type;
                const confirmMessage = userType === 'admin' ? 
                    `Yönetici "${username}" silinecek. Bu işlem geri alınamaz!\nOnaylıyor musunuz?` :
                    `Kullanıcı "${username}" ve tüm kayıtları silinecek. Bu işlem geri alınamaz!\nOnaylıyor musunuz?`;

                if (confirm(confirmMessage)) {
                    deleteUser(username, userType);
                }
            });
        });

        // Kayıtları görüntüleme butonları için olay dinleyicileri
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.dataset.username;
                showUserRecords(username);
            });
        });
    }

    // Kullanıcı silme fonksiyonu
    function deleteUser(username, userType) {
        try {
            if (userType === 'admin') {
                // Yönetici silme
                const ADMIN_USERS = JSON.parse(localStorage.getItem('adminUsers')) || [];
                const updatedAdmins = ADMIN_USERS.filter(admin => admin.username !== username);
                localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
            } else {
                // Normal kullanıcı silme
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const updatedUsers = users.filter(user => user.username !== username);
                localStorage.setItem('users', JSON.stringify(updatedUsers));

                // Kullanıcının kayıtlarını sil
                const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
                delete tumKayitlar[username];
                localStorage.setItem('kayitlar', JSON.stringify(tumKayitlar));

                // Kullanıcının iletişim bilgilerini sil
                const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
                delete contacts[username];
                localStorage.setItem('contacts', JSON.stringify(contacts));
            }

            alert(`${userType === 'admin' ? 'Yönetici' : 'Kullanıcı'} başarıyla silindi!`);
            showUsers(); // Listeyi güncelle
        } catch (error) {
            console.error('Kullanıcı silme hatası:', error);
            alert('Kullanıcı silinirken bir hata oluştu!');
        }
    }

    // Kullanıcı kayıtlarını göster
    function showUserRecords(username) {
        const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
        const kayitlar = tumKayitlar[username] || [];

        let html = `
            <h2>${username} Kullanıcısının Kayıtları</h2>
            <div class="records-container">
                <div class="records-header">
                    <span>Tarih</span>
                    <span>Yazı</span>
                    <span>Cevşen</span>
                    <span>Kuran</span>
                    <span>Mütala</span>
                    <span>Ezber</span>
                </div>
        `;

        if (kayitlar.length > 0) {
            // Tarihe göre sırala
            kayitlar.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

            kayitlar.forEach(kayit => {
                html += `
                    <div class="record-item">
                        <span>${kayit.tarih}</span>
                        <span>${kayit.yazi || '-'}</span>
                        <span>${kayit.cevsen || '-'}</span>
                        <span>${kayit.kuran || '-'}</span>
                        <span>${kayit.mutala || '-'}</span>
                        <span>${kayit.ezber || '-'}</span>
                    </div>
                `;
            });
        } else {
            html += `
                <div class="no-records">
                    Bu kullanıcının henüz kaydı bulunmamaktadır.
                </div>
            `;
        }

        html += '</div>';
        recordsList.innerHTML = html;
        
        // Kayıtlar bölümünü göster, kullanıcılar bölümünü gizle
        usersSection.classList.add('gizli');
        userRecords.classList.remove('gizli');
    }

    // Geri dönüş butonu olayı
    backToUsers.addEventListener('click', function() {
        userRecords.classList.add('gizli');
        usersSection.classList.remove('gizli');
    });

    // Yönetici şifre güncelleme
    adminPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Şifre kontrolü
        if (newPassword !== confirmNewPassword) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }

        // LocalStorage'dan yönetici bilgilerini al
        const ADMIN_USERS = JSON.parse(localStorage.getItem('adminUsers')) || [];

        // Mevcut şifre kontrolü
        const admin = ADMIN_USERS.find(a => a.username === currentUser);
        if (!admin || admin.password !== currentPassword) {
            alert('Mevcut şifre yanlış!');
            return;
        }

        // Yönetici şifresini güncelle
        const adminIndex = ADMIN_USERS.findIndex(a => a.username === currentUser);
        ADMIN_USERS[adminIndex].password = newPassword;

        // LocalStorage'a kaydet
        localStorage.setItem('adminUsers', JSON.stringify(ADMIN_USERS));

        // Şifre değişikliğini txt'ye kaydet
        appendPasswordChangeToTxt(currentUser, newPassword);

        alert('Şifreniz başarıyla güncellendi!');
        adminPasswordForm.reset();
    });

    // Sayfa yüklendiğinde kullanıcıları göster
    showUsers();
}); 