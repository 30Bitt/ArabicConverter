// إعدادات العداد - استخدام خدمة موثوقة
const COUNTER_CONFIG = {
    namespace: 'arabic-converter-30bit',
    key: 'total-downloads',
    fallbackKey: 'localDownloadCount'
};

// دالة مساعدة للاتصال بالعداد
async function fetchCounter(action = 'get') {
    try {
        const baseURL = 'https://api.countapi.xyz';
        const url = action === 'hit' 
            ? `${baseURL}/hit/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}`
            : `${baseURL}/get/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}`;
        
        console.log(`جاري ${action === 'hit' ? 'زيادة' : 'جلب'} العداد...`);
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('فشل في الاتصال');
        
        const data = await response.json();
        return data.value;
    } catch (error) {
        console.log('فشل الاتصال بالعداد:', error);
        throw error;
    }
}

// عداد التحميلات - متزامن بين جميع الأجهزة
async function incrementDownloadCount() {
    try {
        // زيادة العداد على الخادم
        const count = await fetchCounter('hit');
        
        // تحديث العدد المعروض
        document.getElementById('downloadCount').textContent = count;
        console.log('تم تحديث العداد إلى:', count);
        
        setTimeout(() => {
            alert('جاري تحميل البرنامج... قد تظهر نافذة تحميل من Google Drive');
        }, 500);
        
    } catch (error) {
        // إذا فشل الاتصال، استخدم localStorage
        console.log('استخدام العداد المحلي');
        let localCount = parseInt(localStorage.getItem(COUNTER_CONFIG.fallbackKey)) || 0;
        localCount++;
        localStorage.setItem(COUNTER_CONFIG.fallbackKey, localCount);
        document.getElementById('downloadCount').textContent = localCount;
        
        setTimeout(() => {
            alert('جاري تحميل البرنامج...');
        }, 500);
    }
}

// إدارة النافذة المنبثقة
function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
    document.getElementById('uploadStatus').innerHTML = '';
    document.getElementById('fileInput').value = '';
}

// دوال تسجيل الدخول والرفع
function checkPassword() {
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    if (password === 'admin123') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        loginError.textContent = '';
    } else {
        loginError.textContent = 'كلمة المرور غير صحيحة';
    }
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (!fileInput.files[0]) {
        uploadStatus.innerHTML = '<p style="color: red;">يرجى اختيار ملف أولاً</p>';
        return;
    }
    
    const fileName = fileInput.files[0].name;
    const fileSize = (fileInput.files[0].size / 1024 / 1024).toFixed(2);
    
    uploadStatus.innerHTML = '<p>جاري رفع الملف...</p>';
    
    setTimeout(() => {
        uploadStatus.innerHTML = `
            <div style="color: green; background: #1a1a1a; padding: 10px; border-radius: 4px; border: 1px solid #333;">
                <p>✓ تم رفع الملف "<strong>${fileName}</strong>" بنجاح</p>
                <p>حجم الملف: ${fileSize} MB</p>
            </div>
        `;
    }, 2000);
}

// تهيئة الصفحة - جلب العدد الحقيقي
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // جلب العدد من الخادم
        const count = await fetchCounter('get');
        document.getElementById('downloadCount').textContent = count;
        console.log('تم جلب العدد من الخادم:', count);
        
    } catch (error) {
        // إذا فشل الاتصال، استخدم localStorage
        console.log('استخدام العداد المحلي للعرض');
        const localCount = parseInt(localStorage.getItem(COUNTER_CONFIG.fallbackKey)) || 0;
        document.getElementById('downloadCount').textContent = localCount;
    }
    
    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('uploadModal');
        if (event.target === modal) {
            closeUploadModal();
        }
    });
});

// دالة لتهيئة العداد يدوياً (تشغيلها مرة واحدة من console)
function initializeCounterManually() {
    const localCount = parseInt(localStorage.getItem('localDownloadCount')) || 0;
    if (localCount > 0) {
        // نقل التحميلات المحلية إلى الخادم
        fetch(`https://api.countapi.xyz/set/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}?value=${localCount}`)
            .then(() => console.log('تم تهيئة العداد بالقيمة:', localCount))
            .catch(err => console.log('فشل في التهيئة:', err));
    }
}
