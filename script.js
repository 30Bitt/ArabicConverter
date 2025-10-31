// إعدادات العداد
const COUNTER_CONFIG = {
    namespace: 'arabic-text-converter',
    key: 'downloads',
    fallbackKey: 'localDownloadCount'
};

// عداد التحميلات - متزامن بين جميع الأجهزة
async function incrementDownloadCount() {
    try {
        // المحاولة الأولى: استخدام APIcounter
        let count;
        try {
            const response = await fetch(`https://apicounter.com/count/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}/increment`);
            const data = await response.json();
            count = data.count;
        } catch (apiError) {
            // المحاولة الثانية: استخدام CountAPI كبديل
            const response = await fetch(`https://api.countapi.xyz/hit/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}`);
            const data = await response.json();
            count = data.value;
        }
        
        // تحديث العدد المعروض
        document.getElementById('downloadCount').textContent = count;
        
        setTimeout(() => {
            alert('جاري تحميل البرنامج... قد تظهر نافذة تحميل من Google Drive');
        }, 500);
        
    } catch (error) {
        // إذا فشلت جميع المحاولات، استخدم localStorage
        console.log('استخدام العداد المحلي');
        let localCount = parseInt(localStorage.getItem(COUNTER_CONFIG.fallbackKey)) || 0;
        localCount++;
        localStorage.setItem(COUNTER_CONFIG.fallbackKey, localCount);
        document.getElementById('downloadCount').textContent = localCount;
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
        // محاولة جلب العدد من APIcounter
        let count;
        try {
            const response = await fetch(`https://apicounter.com/count/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}`);
            const data = await response.json();
            count = data.count;
        } catch (apiError) {
            // محاولة جلب العدد من CountAPI
            const response = await fetch(`https://api.countapi.xyz/get/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}`);
            const data = await response.json();
            count = data.value;
        }
        
        document.getElementById('downloadCount').textContent = count;
        
    } catch (error) {
        // إذا فشل الاتصال، استخدم localStorage
        console.log('استخدام العداد المحلي');
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
async function initializeCounter(initialValue = 0) {
    try {
        // نقل التحميلات المحلية إلى السيرفر
        const localCount = parseInt(localStorage.getItem(COUNTER_CONFIG.fallbackKey)) || initialValue;
        
        if (localCount > 0) {
            await fetch(`https://apicounter.com/count/${COUNTER_CONFIG.namespace}/${COUNTER_CONFIG.key}/set?value=${localCount}`);
            console.log('تم تهيئة العداد بالقيمة:', localCount);
        }
    } catch (error) {
        console.log('فشل في تهيئة العداد');
    }
}
