// إعدادات Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydvR7Qmw2mkpiRYDzcpoJflgamG1RH39ILJ0NW7NngbsnXCke1qyKL0gfDym5q_-fp/exec';

// دالة مساعدة لتسجيل التحميل
async function trackDownload() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'download',
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        return result.count;
    } catch (error) {
        console.log('استخدام العداد المحلي');
        return null;
    }
}

// دالة جلب العدد الحالي
async function getDownloadCount() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const result = await response.json();
        return result.count;
    } catch (error) {
        return null;
    }
}

// عداد التحميلات الرئيسي
async function incrementDownloadCount() {
    const newCount = await trackDownload();
    
    if (newCount !== null) {
        document.getElementById('downloadCount').textContent = newCount;
    } else {
        let localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
        localCount++;
        localStorage.setItem('downloadCount', localCount);
        document.getElementById('downloadCount').textContent = localCount;
    }
    
    setTimeout(() => {
        alert('جاري تحميل البرنامج...');
    }, 500);
}

// باقي الدوال كما هي...
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

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', async function() {
    const currentCount = await getDownloadCount();
    if (currentCount !== null) {
        document.getElementById('downloadCount').textContent = currentCount;
    } else {
        const localCount = parseInt(localStorage.getItem('downloadCount')) || 0;
        document.getElementById('downloadCount').textContent = localCount;
    }
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('uploadModal');
        if (event.target === modal) {
            closeUploadModal();
        }
    });
});
