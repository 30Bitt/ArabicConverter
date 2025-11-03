// script.js - كود كامل وجاهز للنسخ واللصق
// استبدل الرابط بالرابط الناتج عند نشر Google Apps Script (Web app)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVbII3IRqg1DWcM3SNHkcNafMjMG_uHWHjmAiTudIxsSw6ByMjssLykAiVXsi8k5P1/exec';

// --- دالة تسجيل التحميل ---
async function trackDownload() {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'download');
        formData.append('userAgent', navigator.userAgent || 'Unknown');
        formData.append('platform', navigator.platform || 'Unknown');
        formData.append('timestamp', new Date().toISOString());

        // استخدام sendBeacon أولاً لأنه أسرع ولا ينتظر رد
        if (navigator.sendBeacon) {
            const blob = new Blob([formData.toString()], { 
                type: 'application/x-www-form-urlencoded' 
            });
            navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);
        }

        // محاولة fetch في الخلفية للحصول على العدد الحقيقي
        setTimeout(async () => {
            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString()
                });
                
                if (response.ok) {
                    const result = await response.json();
                    // تحديث العداد بالعدد الحقيقي إذا اكتمل
                    if (result.count && !isNaN(result.count)) {
                        updateDownloadCountUI(result.count);
                        localStorage.setItem('downloadCount', String(result.count));
                    }
                }
            } catch (error) {
                console.log('التحديث في الخلفية فشل، لكن العداد زاد محلياً');
            }
        }, 500);

        return null;

    } catch (error) {
        console.error('Error in trackDownload:', error);
        return null;
    }
}

// --- دالة لجلب العدد الحالي من السيرفر ---
async function getDownloadCount() {
    try {
        const resp = await fetch(GOOGLE_SCRIPT_URL + '?_=' + Date.now(), { 
            cache: 'no-store',
            method: 'GET'
        });
        if (!resp.ok) throw new Error('Server response not OK');
        const data = await resp.json();
        return data.count ?? null;
    } catch (err) {
        console.warn('getDownloadCount failed:', err);
        return null;
    }
}

// --- زيادة العداد عند الضغط على زر التحميل ---
let downloadInProgress = false;
async function incrementDownloadCount(event) {
    if (downloadInProgress) return;
    downloadInProgress = true;

    // منع السلوك الافتراضي للرابط
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // زيادة العداد فورياً قبل الانتظار
    let currentCount = parseInt(document.getElementById('downloadCount').textContent) || 0;
    currentCount++;
    updateDownloadCountUI(currentCount);
    flashCount();

    // محاولة تسجيل التحميل في الخلفية
    const newCount = await trackDownload();
    
    if (newCount !== null && !isNaN(newCount)) {
        // إذا حصلنا على العدد الحقيقي، نستخدمه
        updateDownloadCountUI(newCount);
        localStorage.setItem('downloadCount', String(newCount));
    } else {
        // إذا فشل الاتصال، نستخدم العدد المحلي
        localStorage.setItem('downloadCount', String(currentCount));
    }

    // الانتقال للتحميل بعد نصف ثانية
    setTimeout(() => {
        window.location.href = 'https://drive.google.com/uc?export=download&id=1N9xaXBc_vrDQwag0KD78VUgPU5XXfNLL';
        downloadInProgress = false;
    }, 500);
}

// --- تحديث واجهة المستخدم لعرض العدد ---
function updateDownloadCountUI(count) {
    const el = document.getElementById('downloadCount');
    if (!el) return;
    el.textContent = count;
}

// --- تأثير بصري بسيط (قفزة/تكبير مؤقت) ---
function flashCount() {
    const el = document.getElementById('downloadCount');
    if (!el) return;
    el.style.transform = 'scale(1.2)';
    setTimeout(() => {
        el.style.transform = 'scale(1)';
    }, 300);
    
    // تأثير إضافي مع الأنيميشن
    el.animate([
        { transform: 'scale(1)', color: '#ffffff' },
        { transform: 'scale(1.3)', color: '#4CAF50' },
        { transform: 'scale(1)', color: '#ffffff' }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
}

// ----------------- وظائف نافذة الرفع والواجهات -----------------
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'block';
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'none';

    // إعادة تهيئة الفورم
    const password = document.getElementById('password');
    if (password) password.value = '';

    const loginSection = document.getElementById('loginSection');
    const uploadSection = document.getElementById('uploadSection');
    const loginError = document.getElementById('loginError');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileInput = document.getElementById('fileInput');

    if (loginSection) loginSection.style.display = 'block';
    if (uploadSection) uploadSection.style.display = 'none';
    if (loginError) loginError.textContent = '';
    if (uploadStatus) uploadStatus.innerHTML = '';
    if (fileInput) fileInput.value = '';
}

function checkPassword() {
    const password = document.getElementById('password')?.value || '';
    const loginError = document.getElementById('loginError');
    if (password === 'admin123') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        if (loginError) loginError.textContent = '';
    } else {
        if (loginError) loginError.textContent = 'كلمة المرور غير صحيحة';
    }
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        if (uploadStatus) uploadStatus.innerHTML = '<p style="color: red;">يرجى اختيار ملف أولاً</p>';
        return;
    }

    const fileName = fileInput.files[0].name;
    const fileSize = (fileInput.files[0].size / 1024 / 1024).toFixed(2);

    if (uploadStatus) uploadStatus.innerHTML = '<p>جاري رفع الملف...</p>';

    // محاكاة رفع
    setTimeout(() => {
        if (uploadStatus) {
            uploadStatus.innerHTML = `
            <div style="color: green; background: #1a1a1a; padding: 10px; border-radius: 4px; border: 1px solid #333;">
                <p>✓ تم رفع الملف "<strong>${escapeHtml(fileName)}</strong>" بنجاح</p>
                <p>حجم الملف: ${fileSize} MB</p>
            </div>
        `;
        }
    }, 1500);
}

// مساعدة بسيطة لتفادي إدخال HTML في اسم الملف عند العرض
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// إغلاق المودال عند النقر خارج المحتوى
window.addEventListener('click', function(event) {
    const modal = document.getElementById('uploadModal');
    if (modal && event.target === modal) {
        closeUploadModal();
    }
});

// ----------------- تهيئة الصفحة عند التحميل -----------------
document.addEventListener('DOMContentLoaded', async function() {
    // الأولوية للعداد المحلي للحصول على استجابة فورية
    const localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
    updateDownloadCountUI(localCount);
    
    // جلب العدد الحقيقي من السيرفر في الخلفية
    setTimeout(async () => {
        const currentCount = await getDownloadCount();
        if (currentCount !== null && !isNaN(currentCount)) {
            updateDownloadCountUI(currentCount);
            localStorage.setItem('downloadCount', String(currentCount));
        }
    }, 1000);
});

// إضافة تأثير عند التمرير فوق زر التحميل
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
        });
        
        downloadBtn.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.2)';
        });
    }
});
