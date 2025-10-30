// عداد التحميلات
function incrementDownloadCount() {
    let count = parseInt(localStorage.getItem('downloadCount')) || 0;
    count++;
    localStorage.setItem('downloadCount', count);
    document.getElementById('downloadCount').textContent = count;
    
    setTimeout(() => {
        alert('جاري تحميل البرنامج... قد تظهر نافذة تحميل من Google Drive');
    }, 500);
}

// إدارة النافذة المنبثقة
function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

// دوال تسجيل الدخول والرفع
function checkPassword() {
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    // كلمة المرور الافتراضية - يمكنك تغييرها
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
    
    // محاكاة عملية الرفع
    uploadStatus.innerHTML = '<p>جاري رفع الملف...</p>';
    
    setTimeout(() => {
        uploadStatus.innerHTML = `
            <div class="upload-status success">
                <p>✓ تم رفع الملف بنجاح (محاكاة)</p>
                <p><small>ملاحظة: هذا محاكاة فقط في GitHub Pages</small></p>
            </div>
        `;
    }, 2000);
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة عداد التحميلات
    let count = parseInt(localStorage.getItem('downloadCount')) || 0;
    document.getElementById('downloadCount').textContent = count;
    
    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('uploadModal');
        if (event.target === modal) {
            closeUploadModal();
        }
    });
});