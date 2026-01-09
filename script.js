// PDF Kütüphanesini Tanıt
// Eğer pdfjsLib yüklenmediyse uyarı ver
if (typeof pdfjsLib === 'undefined') {
    alert("HATA: PDF kütüphanesi yüklenemedi! İnternet bağlantını kontrol et.");
} else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const inputText = document.getElementById("inputText");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const wordDisplay = document.getElementById("word-display");
const setupPanel = document.getElementById("setup-panel");
const readPanel = document.getElementById("read-panel");
const speedRange = document.getElementById("speedRange");
const sizeRange = document.getElementById("sizeRange");
const pdfInput = document.getElementById("pdfInput");
const fileNameLabel = document.getElementById("fileName");

let words = [];
let currentIndex = 0;
let intervalId = null;

// PDF Yükleme Olayı
pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameLabel.innerText = file.name;
    inputText.value = "⏳ PDF okunuyor, lütfen bekleyin...";
    alert("Dosya seçildi: " + file.name + ". İşlem başlıyor...");

    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // PDF Belgesini Yükle
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        alert("PDF Başarıyla açıldı! Sayfa sayısı: " + pdf.numPages);

        let fullText = "";

        // Sayfaları Tek Tek Gez
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Sayfadaki yazıları birleştir
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + " ";
        }

        if (fullText.trim().length === 0) {
            alert("UYARI: PDF içinde okunabilir metin bulunamadı! Bu bir resim veya taranmış kitap olabilir.");
            inputText.value = "Bu PDF metin içermiyor (Resim olabilir).";
        } else {
            inputText.value = fullText;
            alert("İşlem Tamam! " + fullText.length + " karakter okundu.");
        }
        
    } catch (err) {
        console.error(err);
        alert("BİR HATA OLUŞTU:\n" + err.message);
        inputText.value = "Hata oluştu: " + err.message;
    }
});

// Başlat Butonu
startBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    // "PDF okunuyor" yazarken başlatmayı engelle
    if (!text || text.startsWith("⏳") || text.startsWith("Hata")) {
        alert("Lütfen geçerli bir metin yüklenmesini bekleyin.");
        return;
    }

    words = text.split(/\s+/);
    currentIndex = 0;

    setupPanel.classList.add("hidden");
    readPanel.classList.remove("hidden");
    startReading();
});

function startReading() {
    const speed = parseInt(speedRange.value);
    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(() => {
        if (currentIndex >= words.length) {
            stopReading();
            return;
        }
        wordDisplay.innerText = words[currentIndex];
        currentIndex++;
    }, speed);
}

stopBtn.addEventListener("click", stopReading);

function stopReading() {
    clearInterval(intervalId);
    setupPanel.classList.remove("hidden");
    readPanel.classList.add("hidden");
    wordDisplay.innerText = "Hazır...";
}

sizeRange.addEventListener("input", (e) => {
    wordDisplay.style.fontSize = e.target.value + "px";
});