(function() {
    // clean and format the tags
    function cleanTag(tag) {
        return tag.replace(/[\?]/g, '').replace(/_/g, ' ').trim().toLowerCase();
    }
    // load the presents from the storage to be added to the tag list
    function loadPresets(callback) {
        chrome.storage.local.get('presets', (data) => {
            const presets = data.presets || [];
            callback(presets);
        });
    }
    // Load settings from storage
    function loadSettings(callback) {
        chrome.storage.local.get({
            enableDownloadButton: true,
            enableDownloadTags: true
        }, callback);
    }

    function getCurrentSiteConfig() {
        const hostname = window.location.hostname;
        return TagCopierConfig.siteConfigs[Object.keys(TagCopierConfig.siteConfigs).find(key => hostname.includes(key))];
    }

    function extractTagsFromSelectors(selectors) {
        const allTags = [];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const cleanTagText = cleanTag(el.textContent);
                if (cleanTagText) {
                    allTags.push(cleanTagText);
                }
            });
        });
        return allTags.filter(tag => tag && tag.length > 0);
    }

    function getAllTags(config) {
        if (config && config.selectors) {
            let allTags = [];
            for (const category in config.selectors) {
                const selector = config.selectors[category];
                if (selector) {
                    allTags = allTags.concat(extractTagsFromSelectors([selector])); // Pass selector as an array
                }
            }
            return allTags;
        }
        return getTagsFromFallback();
    }
    // Fallback to generic selectors if no config is found,

    function getTagsFromFallback() {
        const allTags = [];
        const selectors = TagCopierConfig.genericBooruSelectors;
        for (const category in selectors) {
            if (category !== 'fallback') {
                allTags.push(...extractTagsFromSelectors(selectors[category])); // Use spread syntax
            }
        }
        if (allTags.length === 0) {
            allTags.push(...extractTagsFromSelectors(selectors.fallback));
        }
        return allTags;
    }

    async function downloadImageAndTags() {
        const imageUrl = getImageUrl();
        if (!imageUrl) {
            console.error('Could not find image URL');
            return false;
        }
        let enableDownloadTags;
        await new Promise(resolve => {
            loadSettings(items => {
                enableDownloadTags = items.enableDownloadTags;
                resolve();
            });
        });
        try {
            // Extract base filename from URL
            const urlParts = imageUrl.split('/');
            let filename = urlParts[urlParts.length - 1];
            // Remove query params if they exists
            filename = filename.split("?")[0];
            // Remove file extension
            const baseFilename = filename.split('.').slice(0, -1).join('.');
            const urlPartsExt = imageUrl.split('.');
            const extension = urlPartsExt[urlPartsExt.length - 1].split('?')[0];

            // Get tags
            const config = getCurrentSiteConfig();
            const tags = getAllTags(config);
            let tagContent = "";
            if (enableDownloadTags) {
                await new Promise((resolve) => {
                    loadPresets((presets) => {
                        const selectedPresets = presets.filter(preset => preset.selected);
                        const beginningPresets = selectedPresets
                            .filter(preset => preset.position === 'beginning')
                            .flatMap(preset => preset.tags);
                        const endPresets = selectedPresets
                            .filter(preset => preset.position === 'end')
                            .flatMap(preset => preset.tags);

                        const allTags = [...beginningPresets, ...tags, ...endPresets];
                        tagContent = allTags.join(', ');
                        resolve();
                    });
                });
            }
            const tagsFilename = `${baseFilename}.txt`;


            if (enableDownloadTags) {
                // Create a temporary link for downloading the tags
                const downloadLink = document.createElement('a');
                const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(tagContent);
                downloadLink.href = dataUri;
                downloadLink.download = tagsFilename; // Set the desired filename
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }

            // Send message to background script to download the image
            return new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: "downloadImage", // Changed action name
                    imageUrl: imageUrl,
                    filename: `${baseFilename}.${extension}`
                }, response => {
                    if (chrome.runtime.lastError) {
                        console.error('Image download error:', chrome.runtime.lastError);
                        resolve(false);
                        return;
                    }

                    if (response && response.status === "downloading") {
                        console.log('Image download started successfully');
                        resolve(true);
                    } else {
                        console.error('Unexpected response:', response);
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('Error in downloadImageAndTags:', error);
            return false;
        }
    }



    function createButtons() {
        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });

        // Copy button
        const copyButton = document.createElement('button');
        const buttonStyles = {
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            color: 'white'
        };

        // Apply styles to copy button
        Object.keys(buttonStyles).forEach(key => {
            copyButton.style[key] = buttonStyles[key];
        });

        // Download button
        const downloadButton = document.createElement('button');
        // Apply styles to download button
        Object.keys(buttonStyles).forEach(key => {
            downloadButton.style[key] = buttonStyles[key];
        });

        copyButton.textContent = 'Copy Tags';
        downloadButton.textContent = 'Download';

        // Set colors based on site
        const backgroundColor = getSiteColor(window.location.hostname);
        copyButton.style.backgroundColor = backgroundColor;
        downloadButton.style.backgroundColor = backgroundColor;

        // Hover effects
        [copyButton, downloadButton].forEach(button => {
            button.onmouseover = () => {
                button.style.backgroundColor = darkenColor(backgroundColor, 0.2);
                button.style.transform = 'scale(1.05)';
            };
            button.onmouseout = () => {
                button.style.backgroundColor = backgroundColor;
                button.style.transform = 'scale(1)';
            };
        });

        // Copy functionality
        copyButton.onclick = () => {
            const config = getCurrentSiteConfig();
            const tags = getAllTags(config);

            loadPresets((presets) => {
                const selectedPresets = presets.filter(preset => preset.selected);
                const beginningPresets = selectedPresets
                    .filter(preset => preset.position === 'beginning')
                    .flatMap(preset => preset.tags);
                const endPresets = selectedPresets
                    .filter(preset => preset.position === 'end')
                    .flatMap(preset => preset.tags);

                const tagString = [
                    ...beginningPresets,
                    ...tags,
                    ...endPresets
                ].join(', ');

                navigator.clipboard.writeText(tagString)
                    .then(() => {
                        copyButton.textContent = `Copied ${beginningPresets.length + tags.length + endPresets.length} tags!`;
                        setTimeout(() => {
                            copyButton.textContent = 'Copy Tags';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy tags:', err);
                        copyButton.textContent = 'Failed to copy';
                        setTimeout(() => {
                            copyButton.textContent = 'Copy Tags';
                        }, 2000);
                    });
            });
        };

        // Download functionality
        downloadButton.onclick = async() => {
            let enableDownloadButton;
            await new Promise(resolve => {
                loadSettings(items => {
                    enableDownloadButton = items.enableDownloadButton;
                    resolve();
                });
            });
            if (enableDownloadButton) {
                downloadButton.textContent = 'Downloading...';
                await downloadImageAndTags();
                downloadButton.textContent = 'Downloaded!';
                setTimeout(() => {
                    downloadButton.textContent = 'Download';
                }, 2000);
            } else {
                downloadButton.textContent = 'Disabled';
                setTimeout(() => {
                    downloadButton.textContent = 'Download';
                }, 2000);

            }
        };

        let enableDownloadButton;
        loadSettings(items => {
            enableDownloadButton = items.enableDownloadButton;
            if (!enableDownloadButton)
                downloadButton.style.display = 'none';
        });

        buttonContainer.appendChild(downloadButton);
        buttonContainer.appendChild(copyButton);
        return buttonContainer;
    }

    function init() {
        const buttons = createButtons();
        document.body.appendChild(buttons);

        // Keyboard shortcuts
        document.addEventListener('keyup', (e) => {
            if (e.key === ']') {
                buttons.lastChild.click(); // Copy tags
            } else if (e.key === '[') {
                buttons.firstChild.click(); // Download
            }
        });
    }
    // listener to message from the popup
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.action === "updateSettings") {
                loadSettings(items => {
                    if (!items.enableDownloadButton) {
                        const downloadButton = document.querySelector('button:contains("Download")');
                        if (downloadButton) {
                            downloadButton.style.display = 'none';
                        }

                    } else {
                        const downloadButton = document.querySelector('button:contains("Download")');
                        if (downloadButton) {
                            downloadButton.style.display = '';
                        }
                    }
                });
            }
        }
    );


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    // Inject config.js into the page
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('config.js');
    script.onload = function() {
        this.remove(); // clean up after injection
    };
    (document.head || document.documentElement).appendChild(script);

})();