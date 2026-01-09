// PDF.js Kütüphanesi Ayarları
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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

// PDF Yükleme İşlemi
pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameLabel.innerText = file.name;
    inputText.value = "PDF okunuyor, lütfen bekleyin...";
    startBtn.disabled = true; // İşlem bitene kadar butonu kilitle

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + " ";
        }

        inputText.value = fullText;
        startBtn.disabled = false; // İşlem bitti, butonu aç
        alert("PDF başarıyla yüklendi! Okumaya başlayabilirsin.");
        
    } catch (err) {
        console.error(err);
        inputText.value = "Hata: PDF okunamadı.";
        startBtn.disabled = false;
    }
});

// Başla Butonu
startBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text) {
        alert("Lütfen bir metin girin veya PDF yükleyin!");
        return;
    }

    words = text.split(/\s+/);
    currentIndex = 0;

    setupPanel.classList.add("hidden");
    readPanel.classList.remove("hidden");

    startReading();
});

// Okuma Motoru
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

// Durdur Butonu
stopBtn.addEventListener("click", stopReading);

function stopReading() {
    clearInterval(intervalId);
    setupPanel.classList.remove("hidden");
    readPanel.classList.add("hidden");
    wordDisplay.innerText = "Hazır...";
}

// Boyut Ayarı
sizeRange.addEventListener("input", (e) => {
    wordDisplay.style.fontSize = e.target.value + "px";
});