const inputText = document.getElementById("inputText");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const wordDisplay = document.getElementById("word-display");
const setupPanel = document.getElementById("setup-panel");
const readPanel = document.getElementById("read-panel");
const speedRange = document.getElementById("speedRange");
const sizeRange = document.getElementById("sizeRange");

let words = [];
let currentIndex = 0;
let intervalId = null;

startBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text) {
        alert("Lütfen önce bir metin yapıştır!");
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