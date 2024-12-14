document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı verilerini localStorage'dan al
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Yönetici bilgileri
    let ADMIN_USERS = JSON.parse(localStorage.getItem('adminUsers')) || [];

    // Mevcut kullanıcı kontrolü
    const currentUser = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Çıkış butonunu kontrol et
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('rememberedUser');
            window.location.href = 'login.html';
        });
    }

    // Kullanıcı bilgilerini göster
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay && currentUser) {
        userDisplay.textContent = `Hoş geldin, ${currentUser}${isAdmin ? ' (Yönetici)' : ''}`;
    }

    // Login sayfasında değilsek ve giriş yapılmamışsa login'e yönlendir
    if (!window.location.pathname.endsWith('login.html')) {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Yönetici sayfasında normal kullanıcı kontrolü
        if (window.location.pathname.endsWith('admin.html') && !isAdmin) {
            window.location.href = 'index.html';
            return;
        }

        // Normal kullanıcı sayfasında yönetici kontrolü
        if (window.location.pathname.endsWith('index.html') && isAdmin) {
            window.location.href = 'admin.html';
            return;
        }
    }

    // Kayıtlı kullanıcı bilgilerini kontrol et
    const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser'));
    if (rememberedUser && !currentUser) {
        const { username, password, isAdmin } = rememberedUser;
        // Kullanıcı tipine göre giriş yap
        if (isAdmin) {
            const admin = ADMIN_USERS.find(a => a.username === username && a.password === password);
            if (admin) {
                localStorage.setItem('currentUser', username);
                localStorage.setItem('isAdmin', 'true');
                window.location.href = 'admin.html';
                return;
            }
        } else {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', username);
                localStorage.setItem('isAdmin', 'false');
                window.location.href = 'index.html';
                return;
            }
        }
        // Eğer kullanıcı bulunamazsa hatırlanan bilgileri sil
        localStorage.removeItem('rememberedUser');
    }

    // Yeni kullanıcıyı txt'ye kaydet
    function appendUserToTxt(username, password, isAdmin) {
        const date = new Date().toLocaleString('tr-TR');
        const formattedDate = date.replace(/[/:]/g, '_');
        
        let content = '';
        if (isAdmin) {
            content = `YÖNETİCİ KAYIT BİLGİLERİ\n`;
            content += `======================\n\n`;
            content += `Kayıt Tarihi: ${date}\n`;
            content += `Kullanıcı Tipi: YÖNETİCİ\n`;
            content += `Kullanıcı Adı: ${username}\n`;
            content += `Şifre: ${password}\n`;
            content += `======================`;
        } else {
            content = `KULLANICI KAYIT BİLGİLERİ\n`;
            content += `======================\n\n`;
            content += `Kayıt Tarihi: ${date}\n`;
            content += `Kullanıcı Tipi: NORMAL KULLANICI\n`;
            content += `Kullanıcı Adı: ${username}\n`;
            content += `Şifre: ${password}\n`;
            content += `======================`;
        }

        // Dosyayı oluştur ve indir
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${username}_kayit_bilgileri_${formattedDate}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Giriş sayfasındaysak
    if (window.location.pathname.endsWith('login.html')) {
        // Eğer zaten giriş yapılmışsa yönlendir
        if (currentUser) {
            window.location.href = isAdmin ? 'admin.html' : 'index.html';
            return;
        }

        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const loginBox = document.getElementById('loginBox');
        const registerBox = document.getElementById('registerBox');
        const forgotPasswordBox = document.getElementById('forgotPasswordBox');
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');
        const showForgotPasswordLink = document.getElementById('showForgotPassword');
        const backToLoginLink = document.getElementById('backToLogin');

        // Form geçişleri
        showRegisterLink?.addEventListener('click', function(e) {
            e.preventDefault();
            loginBox.classList.add('hidden');
            forgotPasswordBox.classList.add('hidden');
            registerBox.classList.remove('hidden');
        });

        showLoginLink?.addEventListener('click', function(e) {
            e.preventDefault();
            registerBox.classList.add('hidden');
            forgotPasswordBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
        });

        showForgotPasswordLink?.addEventListener('click', function(e) {
            e.preventDefault();
            loginBox.classList.add('hidden');
            registerBox.classList.add('hidden');
            forgotPasswordBox.classList.remove('hidden');
        });

        backToLoginLink?.addEventListener('click', function(e) {
            e.preventDefault();
            forgotPasswordBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
        });

        // Kayıt tipine göre yönetici kodu alanını göster/gizle
        const registerTypeInputs = document.querySelectorAll('input[name="registerType"]');
        const adminCodeInput = document.getElementById('adminCode');

        registerTypeInputs.forEach(input => {
            input.addEventListener('change', function() {
                if (this.value === 'admin') {
                    adminCodeInput.classList.remove('hidden');
                    adminCodeInput.required = true;
                } else {
                    adminCodeInput.classList.add('hidden');
                    adminCodeInput.required = false;
                    adminCodeInput.value = '';
                }
            });
        });

        // Kullanıcı kaydı
        registerForm?.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const registerType = document.querySelector('input[name="registerType"]:checked').value;
            const adminCode = document.getElementById('adminCode').value;

            if (password !== confirmPassword) {
                alert('Şifreler eşleşmiyor!');
                return;
            }

            // Kullanıcı adı kontrolü
            if (users.some(user => user.username === username) || ADMIN_USERS.some(admin => admin.username === username)) {
                alert('Bu kullanıcı adı zaten kullanılıyor!');
                return;
            }

            const newUser = { username, password };

            if (registerType === 'admin') {
                if (adminCode === '') {
                    alert('Yönetici kodu boş bırakılamaz!');
                    return;
                }

                if (adminCode !== '58SH585') {
                    alert('Yanlış yönetici kodu! Kayıt yapılamadı.\nNot: Büyük/küçük harfe duyarlıdır.');
                    return;
                }

                ADMIN_USERS.push(newUser);
                localStorage.setItem('adminUsers', JSON.stringify(ADMIN_USERS));
                alert('Yönetici kaydınız başarıyla oluşturuldu! Yönetici olarak giriş yapabilirsiniz.');
            } else {
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                alert('Kayıt başarılı! Kullanıcı olarak giriş yapabilirsiniz.');
            }
            
            registerBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
            registerForm.reset();
        });

        // Giriş işlemi
        loginForm?.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const loginType = document.querySelector('input[name="loginType"]:checked').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // LocalStorage'dan güncel kullanıcı listelerini al
            const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
            const currentAdmins = JSON.parse(localStorage.getItem('adminUsers')) || [];

            if (loginType === 'admin') {
                const admin = currentAdmins.find(a => a.username === username && a.password === password);
                if (admin) {
                    if (rememberMe) {
                        localStorage.setItem('rememberedUser', JSON.stringify({
                            username,
                            password,
                            isAdmin: true
                        }));
                    }
                    localStorage.setItem('currentUser', username);
                    localStorage.setItem('isAdmin', 'true');
                    window.location.href = 'admin.html';
                    return;
                } else {
                    alert('Yönetici kullanıcı adı veya şifre yanlış!');
                }
            } else {
                const user = currentUsers.find(u => u.username === username && u.password === password);
                if (user) {
                    if (rememberMe) {
                        localStorage.setItem('rememberedUser', JSON.stringify({
                            username,
                            password,
                            isAdmin: false
                        }));
                    }
                    localStorage.setItem('currentUser', username);
                    localStorage.setItem('isAdmin', 'false');
                    window.location.href = 'index.html';
                    return;
                } else {
                    alert('Kullanıcı adı veya şifre yanlış!');
                }
            }
        });

        // Şifremi unuttum işlemi
        forgotPasswordForm?.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('forgotUsername').value;
            const newPassword = document.getElementById('newForgotPassword').value;
            const confirmPassword = document.getElementById('confirmForgotPassword').value;

            if (newPassword !== confirmPassword) {
                alert('Şifreler eşleşmiyor!');
                return;
            }

            // LocalStorage'dan güncel kullanıcı listesini al
            const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
            const currentAdmins = JSON.parse(localStorage.getItem('adminUsers')) || [];

            // Yönetici şifresi değiştirilemez
            if (currentAdmins.some(admin => admin.username === username)) {
                alert('Yönetici şifresi bu yöntemle değiştirilemez!');
                return;
            }

            const userIndex = currentUsers.findIndex(u => u.username === username);
            if (userIndex === -1) {
                alert('Böyle bir kullanıcı bulunamadı!');
                return;
            }

            currentUsers[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(currentUsers));

            alert('Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.');

            forgotPasswordBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
            forgotPasswordForm.reset();
        });
    }
}); 