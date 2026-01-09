pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// --- HAZIR METİNLER ---
const SAMPLE_TEXTS = {
    1: `Hızlı okuma, gözün bir bakışta gördüğü alanı genişleterek ve iç seslendirmeyi azaltarak yapılan bir okuma tekniğidir. Normalde bir insan dakikada ortalama 150 ile 250 kelime okur. Bu uygulama sayesinde, göz kaslarınızın yorulmasını engelleyerek bu hızı 500 kelimenin üzerine çıkarabilirsiniz. Şu an okuduğunuz bu metin, RSVP (Rapid Serial Visual Presentation) tekniği ile size sunulmaktadır. Gözünüzü kelimenin ortasındaki kırmızı harfe odaklayın ve akışa kendinizi bırakın. Başarılar!`,
    2: `Ahırın avlusunda oynarken aşağıda, gümüş söğütler altında görünmeyen derenin hüzünlü şırıltısını işitirdik. Evimiz iç çitin büyük kestane ağaçları arkasında kaybolmuş gibiydi. Annem İstanbul'a gittiği için benden bir yaş küçük olan kardeşim Hasan'la artık Dadaruh'un yanından hiç ayrılmıyorduk. Bu, babamın seyisi, yaşlı bir adamdı. Sabahleyin erkenden ahıra koşardık. En sevdiğimiz şey atlardı. Dadaruh, onları tımar ederken biz de yemliklerin önünde hayran hayran seyrederdik.`,
    3: `Yapay zeka, insan zekasını taklit eden ve kendini sürekli geliştirebilen sistemlerin genel adıdır. Gelecekte, tıptan mühendisliğe, sanattan eğitime kadar her alanda devrim yaratması beklenmektedir. Ancak bu teknoloji, etik tartışmaları da beraberinde getirmektedir. Makinelerin düşünebilmesi, insanlık için bir tehdit mi yoksa bir kurtuluş mu olacak? Bu sorunun cevabı, teknolojiyi nasıl geliştirdiğimizde ve hangi amaçlarla kullandığımızda saklıdır.`
};

const inputText = document.getElementById("inputText");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn"); // YENİ
const exitBtn = document.getElementById("exitBtn");   // YENİ
const rewindBtn = document.getElementById("rewindBtn");
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
const sampleBtns = document.querySelectorAll('.sample-btn');

let words = [];
let currentIndex = 0;
let isReading = false;
let timeoutId = null;

// Hazır Metin Butonları
sampleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        inputText.value = SAMPLE_TEXTS[id];
        localStorage.removeItem('speedReadIndex');
        currentIndex = 0;
        savedStatus.classList.add('hidden');
        e.target.innerText = "✅ Yüklendi!";
        setTimeout(() => {
            if(id == 1) e.target.innerText = "📚 Hızlı Okuma Nedir?";
            if(id == 2) e.target.innerText = "🐴 Ömer Seyfettin";
            if(id == 3) e.target.innerText = "🤖 Yapay Zeka";
        }, 1000);
    });
});

// Yardımcı: Kırmızı Odak Harfi
function formatWord(word) {
    if (!word) return "";
    const centerIndex = Math.floor((word.length - 1) / 2);
    const start = word.slice(0, centerIndex);
    const middle = word.slice(centerIndex, centerIndex + 1);
    const end = word.slice(centerIndex + 1);
    return `${start}<span class="highlight">${middle}</span>${end}`;
}

window.addEventListener('load', () => {
    const savedText = localStorage.getItem('speedReadText');
    const savedIndex = localStorage.getItem('speedReadIndex');

    if (savedText && savedText.length > 0) {
        inputText.value = savedText;
        savedStatus.classList.remove('hidden');
        savedStatus.innerText = `💾 Kayıtlı okuma bulundu (%${Math.floor((savedIndex / savedText.split(/\s+/).length) * 100)})`;
        if (savedIndex) currentIndex = parseInt(savedIndex);
    }
});

// PDF Yükleme
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
        currentIndex = 0;
        localStorage.removeItem('speedReadIndex');
    } catch (err) {
        console.error(err);
        inputText.value = "Hata: PDF okunamadı.";
        startBtn.disabled = false;
    }
});

// Başlat
startBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text || text.startsWith("⏳")) return;

    localStorage.setItem('speedReadText', text);
    words = text.split(/\s+/);
    
    if (currentIndex >= words.length) currentIndex = 0;

    setupPanel.classList.add("hidden");
    readPanel.classList.remove("hidden");
    
    // Okumayı başlat
    isReading = true;
    pauseBtn.innerText = "⏸️ Duraklat";
    readLoop(); 
});

// Okuma Döngüsü
function readLoop() {
    // Okuma durduysa veya bittiyse dur
    if (!isReading || currentIndex >= words.length) {
        if (currentIndex >= words.length) {
             wordDisplay.innerHTML = "Bitti! 🎉";
             localStorage.removeItem('speedReadIndex');
             isReading = false;
             pauseBtn.innerText = "🔄 Başa Dön";
        }
        return;
    }

    wordDisplay.innerHTML = formatWord(words[currentIndex]);
    
    let startLeft = Math.max(0, currentIndex - 3);
    leftContext.innerText = words.slice(startLeft, currentIndex).join(" ");
    rightContext.innerText = words.slice(currentIndex + 1, currentIndex + 4).join(" ");

    progressBar.innerText = `Kelime: ${currentIndex + 1} / ${words.length}`;
    localStorage.setItem('speedReadIndex', currentIndex);

    let baseSpeed = parseInt(speedRange.value);
    let delay = baseSpeed;
    const currentWord = words[currentIndex];

    if (currentWord.endsWith('.') || currentWord.endsWith('!') || currentWord.endsWith('?')) delay = baseSpeed * 2.2; 
    else if (currentWord.endsWith(',') || currentWord.endsWith(';')) delay = baseSpeed * 1.5; 
    else if (currentWord.length > 10) delay = baseSpeed * 1.3;

    currentIndex++;
    timeoutId = setTimeout(readLoop, delay);
}

// --- YENİ: DURAKLAT BUTONU ---
pauseBtn.addEventListener("click", () => {
    if (currentIndex >= words.length) {
        // Eğer bitmişse ve butona basıldıysa başa sar
        currentIndex = 0;
        isReading = true;
        pauseBtn.innerText = "⏸️ Duraklat";
        readLoop();
        return;
    }

    if (isReading) {
        // Okuyorsa DURDUR
        isReading = false;
        if (timeoutId) clearTimeout(timeoutId);
        pauseBtn.innerText = "▶️ Devam Et";
    } else {
        // Durmuşsa DEVAM ET
        isReading = true;
        pauseBtn.innerText = "⏸️ Duraklat";
        readLoop();
    }
});

// --- YENİ: ÇIKIŞ BUTONU (2 Kere Sor) ---
exitBtn.addEventListener("click", () => {
    // Okumayı geçici durdur
    const wasReading = isReading;
    isReading = false;
    if (timeoutId) clearTimeout(timeoutId);
    pauseBtn.innerText = "▶️ Devam Et";

    // 1. Soru
    const confirm1 = confirm("Okuma ekranından çıkmak istediğine emin misin?");
    
    if (confirm1) {
        // 2. Soru
        const confirm2 = confirm("Gerçekten ana ekrana dönüyor musun? (Kaldığın yer kaydedilecek)");
        
        if (confirm2) {
            // Çıkış Onaylandı
            setupPanel.classList.remove("hidden");
            readPanel.classList.add("hidden");
            savedStatus.innerText = `💾 Duraklatıldı: %${Math.floor((currentIndex / words.length) * 100)}`;
            savedStatus.classList.remove('hidden');
        } else {
            // İkinci soruda vazgeçerse devam et (opsiyonel) veya duraklatılmış bırak
        }
    } else {
        // İlk soruda vazgeçerse, kullanıcı isterse "Devam Et"e basar
    }
});

// Geri Sar
rewindBtn.addEventListener("click", () => {
    if (timeoutId) clearTimeout(timeoutId);
    currentIndex = Math.max(0, currentIndex - 10); // 10 kelime
    
    wordDisplay.innerHTML = formatWord(words[currentIndex]);
    progressBar.innerText = `Geri sarıldı: ${currentIndex + 1}`;
    
    // Eğer okuma aktifse 1sn sonra devam et, değilse duruk kalsın
    if (isReading) {
        setTimeout(() => { readLoop(); }, 1000);
    }
});

sizeRange.addEventListener("input", (e) => {
    wordDisplay.style.fontSize = e.target.value + "px";
});