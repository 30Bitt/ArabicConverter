<script>
// ==========================
// عداد التحميلات - متزامن
// ==========================
const namespace = 'arabic-text-converter-v2';
const key = 'downloads';

async function incrementDownloadCount() {
    try {
        // استدعاء آمن للعداد (ينشئه إن لم يكن موجودًا)
        const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
        const data = await response.json();

        if (data && typeof data.value === 'number') {
            document.getElementById('downloadCount').textContent = data.value;
        }

        setTimeout(() => {
            alert('جاري تحميل البرنامج... قد تظهر نافذة تحميل من Google Drive');
        }, 500);
    } catch (error) {
        console.warn('فشل الاتصال بـ CountAPI، استخدام العداد المحلي:', error);
        let count = parseInt(localStorage.getItem('downloadCount')) || 0;
        count++;
        localStorage.setItem('downloadCount', count);
        document.getElementById('downloadCount').textContent = count;
    }
}

// ==========================
// إدارة النوافذ
// ==========================
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

// ==========================
// تسجيل الدخول والرفع
// ==========================
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

// ==========================
// تهيئة الصفحة
// ==========================
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // جلب العدد الحقيقي من CountAPI
        const response = await fetch(`https://api.countapi.xyz/get/${namespace}/${key}`);
        const data = await response.json();

        if (data && typeof data.value === 'number') {
            document.getElementById('downloadCount').textContent = data.value;
        } else {
            // إنشاء المفتاح إذا لم يكن موجودًا
            await fetch(`https://api.countapi.xyz/create?namespace=${namespace}&key=${key}&value=0`);
            document.getElementById('downloadCount').textContent = 0;
        }

        console.log('العداد الحقيقي:', data.value);
    } catch (error) {
        console.warn('فشل في جلب العداد:', error);
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
</script>
