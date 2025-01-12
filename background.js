chrome.runtime.onInstalled.addListener(() => {
    // Initialize presets as an empty array
    chrome.storage.local.set({
        presets: []
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "downloadImage") {

        chrome.downloads.download({
            url: request.imageUrl,
            filename: request.filename,
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                sendResponse({ status: "error", message: chrome.runtime.lastError.message });
                return;
            }

            sendResponse({ status: "downloading" });
        });

        return true;
    }
});