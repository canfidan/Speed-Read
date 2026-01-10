// Eklenti yüklendiğinde Sağ Tık Menüsünü oluştur
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "hizliOku",
        title: "⚡ Hızlı Oku: Seçileni Aç",
        contexts: ["selection"] 
    });
});

// Menüye tıklanınca ne olsun?
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "hizliOku") {
        // Seçilen metni kaydet ve pencereyi aç
        chrome.storage.local.set({ "secilenMetin": info.selectionText }, () => {
            chrome.windows.create({
                url: "index.html",
                type: "popup",
                width: 900,
                height: 700,
                focused: true
            });
        });
    }
});