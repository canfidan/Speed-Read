pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const inputText = document.getElementById("inputText");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const rewindBtn = document.getElementById("rewindBtn"); // YENİ
const wordDisplay = document.getElementById("word-display");
const leftContext = document.getElementById("left-context");
const rightContext = document.getElementById("right-context");
const setupPanel = document.getElementById("setup-panel");
const readPanel = document.getElementById("read-panel");
const speedRange = document.getElementById("speedRange");
const sizeRange = document.getElementById("sizeRange");
const pdfInput = document.getElementById("pdfInput");
const fileNameLabel = document.getElementById("fileName");
const progressBar = document.getElementById("progress-bar");
const savedStatus = document.getElementById("saved-status");

let words = [];
let currentIndex = 0;
let isReading = false;
let timeoutId = null;

// --- SAYFA AÇILINCA KAYIT KONTROLÜ ---
window.addEventListener('load', () => {
    const savedText = localStorage.getItem('speedReadText');
    const savedIndex = localStorage.getItem('speedReadIndex');

    if (savedText && savedText.length > 0) {
        inputText.value = savedText;
        savedStatus.classList.remove('hidden'); // "Kayıt bulundu" yazısı
        savedStatus.innerText = `💾 Son okumadan kalan: %${Math.floor((savedIndex / savedText.split(/\s+/).length) * 100)}`;
        if (savedIndex) currentIndex = parseInt(savedIndex);
    }
});

// --- PDF YÜKLEME ---
pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameLabel.innerText = file.name;
    inputText.value = "⏳ PDF işleniyor...";
    startBtn.disabled = true;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + " ";
        }

        inputText.value = fullText;
        startBtn.disabled = false;
        
        // Yeni dosya yüklendiği için eski kaydı sıfırla
        currentIndex = 0;
        localStorage.removeItem('speedReadIndex');
        
    } catch (err) {
        console.error(err);
        inputText.value = "Hata: PDF okunamadı.";
        startBtn.disabled = false;
    }
});

// --- BAŞLAT BUTONU ---
startBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text || text.startsWith("⏳")) return;

    // Metni hafızaya al (Auto-Save)
    localStorage.setItem('speedReadText', text);
    
    words = text.split(/\s+/);
    
    // Eğer metin değiştiyse ve kayıtlı index çok ilerideyse sıfırla
    if (currentIndex >= words.length) currentIndex = 0;

    setupPanel.classList.add("hidden");
    readPanel.classList.remove("hidden");
    isReading = true;
    
    readLoop(); // Döngüyü başlat
});

// --- OKUMA DÖNGÜSÜ (AKILLI DURAKSAMA) ---
function readLoop() {
    if (!isReading || currentIndex >= words.length) {
        isReading = false;
        if (currentIndex >= words.length) {
             wordDisplay.innerText = "Bitti! 🎉";
             localStorage.removeItem('speedReadIndex'); // Bitince kaydı sil
        }
        return;
    }

    // Kelimeleri Göster
    wordDisplay.innerText = words[currentIndex];
    
    // Yan kelimeler (Context)
    let startLeft = Math.max(0, currentIndex - 3);
    leftContext.innerText = words.slice(startLeft, currentIndex).join(" ");
    rightContext.innerText = words.slice(currentIndex + 1, currentIndex + 4).join(" ");

    // İlerlemeyi Güncelle ve Kaydet
    progressBar.innerText = `Kelime: ${currentIndex + 1} / ${words.length}`;
    localStorage.setItem('speedReadIndex', currentIndex);

    // --- AKILLI HIZ HESAPLAMA ---
    let baseSpeed = parseInt(speedRange.value);
    let delay = baseSpeed;
    const currentWord = words[currentIndex];

    // Noktalama işaretlerinde yavaşla
    if (currentWord.endsWith('.') || currentWord.endsWith('!') || currentWord.endsWith('?')) {
        delay = baseSpeed * 2.2; // Cümle sonu: 2 kat bekle
    } else if (currentWord.endsWith(',') || currentWord.endsWith(';') || currentWord.endsWith(':')) {
        delay = baseSpeed * 1.5; // Virgül: 1.5 kat bekle
    } else if (currentWord.length > 10) {
        delay = baseSpeed * 1.3; // Uzun kelime: Biraz yavaşla
    }

    currentIndex++;
    
    // Bir sonraki kelime için zamanlayıcı kur
    timeoutId = setTimeout(readLoop, delay);
}

// --- GERİ SARMA ---
rewindBtn.addEventListener("click", () => {
    if (timeoutId) clearTimeout(timeoutId); // Akışı durdur
    currentIndex = Math.max(0, currentIndex - 20); // 20 kelime geri git
    
    // Anında ekrana yansıt
    wordDisplay.innerText = words[currentIndex];
    progressBar.innerText = `Geri sarıldı: ${currentIndex + 1}`;
    
    // 1 saniye bekleyip devam et
    setTimeout(() => {
        if(isReading) readLoop();
    }, 1000);
});

// --- DURDUR ---
stopBtn.addEventListener("click", () => {
    isReading = false;
    if (timeoutId) clearTimeout(timeoutId);
    
    setupPanel.classList.remove("hidden");
    readPanel.classList.add("hidden");
    
    // Durunca kaydı güncelle
    savedStatus.innerText = `💾 Duraklatıldı: %${Math.floor((currentIndex / words.length) * 100)}`;
    savedStatus.classList.remove('hidden');
});

sizeRange.addEventListener("input", (e) => {
    wordDisplay.style.fontSize = e.target.value + "px";
});