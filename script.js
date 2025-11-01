// script.js - كامل وجاهز للصق
// استبدل الرابط بالرابط الناتج عند نشر Google Apps Script (Web app)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// --- دالة تسجيل التحميل (تدعم fetch keepalive و sendBeacon كـ fallback) ---
async function trackDownload() {
    try {
        // البيانات التي نرسلها للسيرفر
        const payload = {
            action: 'download',
            userAgent: navigator.userAgent || 'Unknown',
            platform: navigator.platform || 'Unknown',
            timestamp: new Date().toISOString()
        };

        // نجرب أولاً استخدام fetch مع خيار keepalive للسماح للإرسال أثناء التنقل
        try {
            const formData = new URLSearchParams();
            for (const k in payload) formData.append(k, payload[k]);

            // use keepalive so the POST can complete even if navigation starts
            const resp = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: formData.toString(),
                keepalive: true, // يساعد على الإرسال أثناء التنقل
                cache: 'no-store'
            });

            // محاولة قراءة النتيجة (قد لا تنجح دائماً إذا كانت navigation تسبق الإكمال)
            if (resp && resp.ok) {
                const result = await resp.json();
                return result.count ?? null;
            }
        } catch (errFetch) {
            // لو حدث خطأ عند fetch، نجرب sendBeacon (عادي للـ POST الخفيف)
            if (navigator && navigator.sendBeacon) {
                try {
                    const params = new URLSearchParams();
                    for (const k in payload) params.append(k, payload[k]);
                    const blob = new Blob([params.toString()], { type: 'application/x-www-form-urlencoded;charset=UTF-8' });
                    navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);
                    // sendBeacon لا يعيد نتيجة، لذا نرجع null لكي يستخدم العداد المحلي أو يتم تحديث لاحقاً بجلب getDownloadCount()
                    return null;
                } catch (beErr) {
                    console.error('sendBeacon failed', beErr);
                }
            }
            console.warn('fetch failed in trackDownload:', errFetch);
        }

        return null;
    } catch (err) {
        console.error('trackDownload error:', err);
        return null;
    }
}

// --- دالة لجلب العدد الحالي من السيرفر ---
async function getDownloadCount() {
    try {
        const resp = await fetch(GOOGLE_SCRIPT_URL + '?_=' + Date.now(), { cache: 'no-store' });
        if (!resp.ok) throw new Error('Server response not OK');
        const data = await resp.json();
        return data.count ?? null;
    } catch (err) {
        console.warn('getDownloadCount failed:', err);
        return null;
    }
}

// --- زيادة العداد عند الضغط على زر التحميل ---
let downloadInProgress = false; // لتجنب نقرات متكررة سريعة
async function incrementDownloadCount() {
    if (downloadInProgress) return;
    downloadInProgress = true;

    // نحاول تسجيل التحميل على السيرفر
    const newCount = await trackDownload();

    if (newCount !== null && !isNaN(newCount)) {
        // تحديث العنصر مباشرة بعد استجابة السيرفر
        updateDownloadCountUI(newCount);
        // خزّن نسخة محلية متزامنة
        localStorage.setItem('downloadCount', String(newCount));
    } else {
        // fallback: زيادة العداد محلياً إذا لم نتمكن من الحصول على نتيجة من السيرفر
        let localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
        localCount++;
        localStorage.setItem('downloadCount', localCount);
        updateDownloadCountUI(localCount);
    }

    // تأثير بصري بسيط عند التغيير
    flashCount();

    // تأخير قصير قبل إعادة السماح بالنقر مرة أخرى
    setTimeout(() => downloadInProgress = false, 1000);

    // ملاحظة: إذا أردت فتح التنزيل عبر الجافاسكربت بدلاً من reliance على الرابط <a>,
    // يمكن هنا تنفيذ نافذة تحميل مباشرة. حاليًا الرابط في HTML سيتولى التنزيل.
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
    el.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1.25)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
    ], {
        duration: 400,
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

    // محاكاة رفع (بما أن الرفع الفعلي لم يٌطلب ربطه بسيرفر)
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
    // جلب العدد من السيرفر ومحاولة التحديث
    const currentCount = await getDownloadCount();
    if (currentCount !== null && !isNaN(currentCount)) {
        updateDownloadCountUI(currentCount);
        localStorage.setItem('downloadCount', String(currentCount));
    } else {
        // fallback إلى العداد المحلي
        const localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
        updateDownloadCountUI(localCount);
    }
});
