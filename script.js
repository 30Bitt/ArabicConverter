// عداد التحميلات - متزامن بين جميع الأجهزة
async function incrementDownloadCount() {
    try {
        // استخدام namespace و key ثابتين
        const response = await fetch('https://api.countapi.xyz/hit/arabic-converter-30bit/download-count');
        const data = await response.json();
        
        // تحديث العدد المعروض
        document.getElementById('downloadCount').textContent = data.value;
        
        setTimeout(() => {
            alert('جاري تحميل البرنامج... قد تظهر نافذة تحميل من Google Drive');
        }, 500);
        
    } catch (error) {
        // إذا فشل الاتصال، استخدم localStorage كنسخة احتياطية
        console.log('استخدام العداد المحلي');
        let count = parseInt(localStorage.getItem('downloadCount')) || 0;
        count++;
        localStorage.setItem('downloadCount', count);
        document.getElementById('downloadCount').textContent = count;
    }
}

// إدارة النافذة المنبثقة
function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    // إعادة تعيين النافذة عند الإغلاق
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

// تهيئة الصفحة - مع حل مشكلة القيمة الابتدائية
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // محاولة جلب العدد من CountAPI
        const response = await fetch('https://api.countapi.xyz/get/arabic-converter-30bit/download-count');
        const data = await response.json();
        
        if (data.value === 0) {
            // إذا كان العدد 0، نتحقق من localStorage ونضبط القيمة الأولية
            const localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
            if (localCount > 0) {
                // إذا كان هناك تحميلات سابقة في localStorage، نضبط CountAPI
                await fetch(`https://api.countapi.xyz/set/arabic-converter-30bit/download-count?value=${localCount}`);
                document.getElementById('downloadCount').textContent = localCount;
            } else {
                document.getElementById('downloadCount').textContent = 0;
            }
        } else {
            document.getElementById('downloadCount').textContent = data.value;
        }
        
    } catch (error) {
        // إذا فشل الاتصال، استخدم localStorage
        console.log('استخدام العداد المحلي');
        const count = parseInt(localStorage.getItem('downloadCount')) || 0;
        document.getElementById('downloadCount').textContent = count;
    }
    
    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('uploadModal');
        if (event.target === modal) {
            closeUploadModal();
        }
    });
});

// دالة مساعدة لتهيئة CountAPI بقيمة أولية (يمكن تشغيلها مرة واحدة)
async function initializeCounter() {
    try {
        const localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
        if (localCount > 0) {
            await fetch(`https://api.countapi.xyz/set/arabic-converter-30bit/download-count?value=${localCount}`);
            console.log('تم تهيئة العداد بالقيمة:', localCount);
        }
    } catch (error) {
        console.log('فشل في تهيئة العداد');
    }
}

// تشغيل التهيئة مرة واحدة (اختياري)
// initializeCounter();
