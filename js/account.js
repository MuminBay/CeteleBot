document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const currentUser = localStorage.getItem('currentUser');

    // İletişim bilgilerini yükle
    function loadContactInfo() {
        const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
        const userContact = contacts[currentUser];

        if (userContact) {
            fullNameInput.value = userContact.fullName || '';
            phoneInput.value = userContact.phone || '';
        }
    }

    // Telefon numarası formatını kontrol et
    phoneInput.addEventListener('input', function(e) {
        // Sadece rakam girişine izin ver
        this.value = this.value.replace(/[^0-9]/g, '');

        // 10 haneden fazla girişi engelle
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });

    // Form gönderimi
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fullName = fullNameInput.value.trim();
        const phone = phoneInput.value.trim();

        // Telefon numarası kontrolü
        if (phone.length !== 10 || !phone.startsWith('5')) {
            alert('Lütfen geçerli bir telefon numarası girin (5XX XXX XX XX)');
            return;
        }

        // İletişim bilgilerini kaydet
        const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
        contacts[currentUser] = {
            fullName,
            phone,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('contacts', JSON.stringify(contacts));

        alert('İletişim bilgileriniz başarıyla güncellendi!');
    });

    // Sayfa yüklendiğinde mevcut bilgileri yükle
    loadContactInfo();
}); 