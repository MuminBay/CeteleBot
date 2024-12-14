document.addEventListener('DOMContentLoaded', function() {
    const userList = document.getElementById('userList');
    const updatePasswordForm = document.getElementById('updatePasswordForm');
    const currentUser = localStorage.getItem('currentUser');

    // Kullanıcı listesini göster
    function showUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        let html = '';

        users.forEach(user => {
            html += `
                <div class="user-item">
                    <span class="username">${user.username}</span>
                    ${user.username === currentUser ? '<span class="current-user">(Aktif Kullanıcı)</span>' : ''}
                </div>
            `;
        });

        if (users.length === 0) {
            html = '<div class="user-item">Henüz kayıtlı kullanıcı bulunmamaktadır.</div>';
        }

        userList.innerHTML = html;
    }

    // Şifre güncelleme
    updatePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Şifre kontrolü
        if (newPassword !== confirmNewPassword) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }

        // Kullanıcıları al
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === currentUser);

        if (userIndex === -1) {
            alert('Kullanıcı bulunamadı!');
            return;
        }

        // Mevcut şifre kontrolü
        if (users[userIndex].password !== currentPassword) {
            alert('Mevcut şifre yanlış!');
            return;
        }

        // Şifreyi güncelle
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));

        alert('Şifreniz başarıyla güncellendi!');
        updatePasswordForm.reset();
    });

    // Sayfa yüklendiğinde kullanıcıları göster
    showUsers();
}); 