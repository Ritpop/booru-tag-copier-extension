chrome.runtime.onInstalled.addListener(() => {
    // Initialize presets as an empty array, may add a few by the deault in the future
    chrome.storage.local.set({
        presets: []
    });
});