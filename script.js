pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const inputText = document.getElementById("inputText");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const wordDisplay = document.getElementById("word-display");
const leftContext = document.getElementById("left-context");   // YENİ
const rightContext = document.getElementById("right-context"); // YENİ
const setupPanel = document.getElementById("setup-panel");
const readPanel = document.getElementById("read-panel");
const speedRange = document.getElementById("speedRange");
const sizeRange = document.getElementById("sizeRange");
const pdfInput = document.getElementById("pdfInput");
const fileNameLabel = document.getElementById("fileName");
const progressBar = document.getElementById("progress-bar");

let words = [];
let currentIndex = 0;
let intervalId = null;

// PDF Yükleme
pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameLabel.innerText = file.name;
    inputText.value = "⏳ PDF okunuyor...";
    startBtn.disabled = true;

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
        startBtn.disabled = false;
        
    } catch (err) {
        console.error(err);
        inputText.value = "Hata: PDF okunamadı.";
        startBtn.disabled = false;
    }
});

startBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text || text.startsWith("⏳")) return;

    words = text.split(/\s+/); // Boşluklara göre böl
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
        
        // 1. ORTA KELİME
        wordDisplay.innerText = words[currentIndex];

        // 2. SOLDAKİ 3 KELİME (Varsa)
        // Başlangıçta negatif index olmaması için Math.max kullanıyoruz
        let startLeft = Math.max(0, currentIndex - 3);
        let leftWords = words.slice(startLeft, currentIndex).join(" ");
        leftContext.innerText = leftWords;

        // 3. SAĞDAKİ 3 KELİME (Varsa)
        let rightWords = words.slice(currentIndex + 1, currentIndex + 4).join(" ");
        rightContext.innerText = rightWords;

        // İlerleme Çubuğu
        progressBar.innerText = `Kelime: ${currentIndex + 1} / ${words.length}`;
        
        currentIndex++;
    }, speed);
}

stopBtn.addEventListener("click", stopReading);

function stopReading() {
    clearInterval(intervalId);
    setupPanel.classList.remove("hidden");
    readPanel.classList.add("hidden");
    wordDisplay.innerText = "Hazır...";
    leftContext.innerText = "";
    rightContext.innerText = "";
}

sizeRange.addEventListener("input", (e) => {
    wordDisplay.style.fontSize = e.target.value + "px";
});