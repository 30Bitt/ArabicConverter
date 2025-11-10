// script.js - كود معدل ومتوافق مع GitHub
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyl0NBca1zZHL5ofCnXLH68Jfer4OrYIc_cCncQywrs9byrpQuI3KEI6sgFr0BZCYLj/exec';

// ✅ دالة فتح فيديو اليوتيوب المضافة
function openYouTubeVideo() {
    window.open('https://youtu.be/mDN9Z8NDYDk', '_blank');
}

let downloadInProgress = false;

// دالة زيادة العداد
async function incrementDownloadCount(event) {
    if (downloadInProgress) return;
    downloadInProgress = true;

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // زيادة العداد فورياً
    let currentCount = parseInt(document.getElementById('downloadCount').textContent) || 0;
    currentCount++;
    updateDownloadCountUI(currentCount);
    flashCount();

    // تسجيل التحميل في الخلفية
    try {
        await trackDownload();
    } catch (error) {
        console.log('التسجيل في الخلفية فشل، لكن العداد زاد محلياً');
    }

    // حفظ محلياً
    localStorage.setItem('downloadCount', String(currentCount));

    // الانتقال للتحميل
    setTimeout(() => {
        window.location.href = 'https://drive.google.com/uc?export=download&id=1N9xaXBc_vrDQwag0KD78VUgPU5XXfNLL';
        downloadInProgress = false;
    }, 500);
}

// دالة تسجيل التحميل
async function trackDownload() {
    return new Promise((resolve) => {
        const formData = new URLSearchParams();
        formData.append('action', 'download');
        formData.append('userAgent', navigator.userAgent || 'Unknown');
        formData.append('platform', navigator.platform || 'Unknown');
        formData.append('timestamp', new Date().toISOString());

        // استخدام sendBeacon أولاً
        if (navigator.sendBeacon) {
            const blob = new Blob([formData.toString()], { 
                type: 'application/x-www-form-urlencoded' 
            });
            navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);
        }

        // تحديث العدد الحقيقي في الخلفية
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
                    if (result.count && !isNaN(result.count)) {
                        updateDownloadCountUI(result.count);
                        localStorage.setItem('downloadCount', String(result.count));
                    }
                }
            } catch (error) {
                // تجاهل الخطأ في الخلفية
            }
        }, 300);

        resolve();
    });
}

// دالة جلب العدد الحالي
async function getDownloadCount() {
    try {
        const resp = await fetch(GOOGLE_SCRIPT_URL + '?_=' + Date.now(), { 
            cache: 'no-store'
        });
        if (!resp.ok) throw new Error('Server error');
        const data = await resp.json();
        return data.count || null;
    } catch (err) {
        return null;
    }
}

// تحديث واجهة المستخدم
function updateDownloadCountUI(count) {
    const el = document.getElementById('downloadCount');
    if (el) {
        el.textContent = count;
    }
}

// تأثير بصري
function flashCount() {
    const el = document.getElementById('downloadCount');
    if (!el) return;
    
    el.style.transform = 'scale(1.2)';
    setTimeout(() => {
        el.style.transform = 'scale(1)';
    }, 300);
}

// وظائف نافذة الرفع
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'block';
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'none';

    const password = document.getElementById('password');
    const loginSection = document.getElementById('loginSection');
    const uploadSection = document.getElementById('uploadSection');
    const loginError = document.getElementById('loginError');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileInput = document.getElementById('fileInput');

    if (password) password.value = '';
    if (loginSection) loginSection.style.display = 'block';
    if (uploadSection) uploadSection.style.display = 'none';
    if (loginError) loginError.textContent = '';
    if (uploadStatus) uploadStatus.innerHTML = '';
    if (fileInput) fileInput.value = '';
}

function checkPassword() {
    const password = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    
    if (password && password.value === 'admin123') {
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
        if (uploadStatus) {
            uploadStatus.innerHTML = '<p style="color: red;">يرجى اختيار ملف أولاً</p>';
        }
        return;
    }

    const fileName = fileInput.files[0].name;
    const fileSize = (fileInput.files[0].size / 1024 / 1024).toFixed(2);

    if (uploadStatus) {
        uploadStatus.innerHTML = '<p>جاري رفع الملف...</p>';
    }

    setTimeout(() => {
        if (uploadStatus) {
            uploadStatus.innerHTML = `
            <div style="color: green; background: #1a1a1a; padding: 10px; border-radius: 4px; border: 1px solid #333;">
                <p>تم رفع الملف "<strong>${fileName}</strong>" بنجاح</p>
                <p>حجم الملف: ${fileSize} MB</p>
            </div>
        `;
        }
    }, 1500);
}

// إغلاق المودال
window.addEventListener('click', function(event) {
    const modal = document.getElementById('uploadModal');
    if (modal && event.target === modal) {
        closeUploadModal();
    }
});

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
    updateDownloadCountUI(localCount);
    
    setTimeout(async () => {
        const currentCount = await getDownloadCount();
        if (currentCount !== null && !isNaN(currentCount)) {
            updateDownloadCountUI(currentCount);
            localStorage.setItem('downloadCount', String(currentCount));
        }
    }, 1000);
});
