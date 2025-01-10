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
    // self descriptive, I thinking in moving it into the config.js as well
    function getCurrentSiteConfig() {
        const hostname = window.location.hostname;
        return TagCopierConfig.siteConfigs[Object.keys(TagCopierConfig.siteConfigs).find(key => hostname.includes(key))];
    }
    // Based on the selectors, selects and save the tags in the array.
    function getAllTags(config) {
        const allTags = [];
        if (config && config.selectors) {
            Object.keys(config.selectors).forEach(category => {
                if (config.selectors[category]) {
                    document.querySelectorAll(config.selectors[category]).forEach(el => {
                        const cleanTagText = cleanTag(el.textContent);
                        if (cleanTagText) {
                            allTags.push(cleanTagText);
                        }
                    });
                }
            });
            return allTags.filter(tag => tag && tag.length > 0);
        }

        return getTagsFromFallback();
    }
    // Fallback to generic selectors if no config is found,

    function getTagsFromFallback() {
        const allTags = [];
        const selectors = TagCopierConfig.genericBooruSelectors;
        for (const category in selectors) {
            if (category !== 'fallback') {
                const selectorList = selectors[category];
                for (const selector of selectorList) {
                    document.querySelectorAll(selector).forEach(el => {
                        const cleanTagText = cleanTag(el.textContent);
                        if (cleanTagText) {
                            allTags.push(cleanTagText);
                        }
                    });
                }
            }
        }
        if (allTags.length === 0) {
            const fallbackSelectors = selectors.fallback;
            for (const selector of fallbackSelectors) {
                document.querySelectorAll(selector).forEach(el => {
                    const cleanTagText = cleanTag(el.textContent);
                    if (cleanTagText) {
                        allTags.push(cleanTagText);
                    }
                });
            }
        }


        return allTags.filter(tag => tag && tag.length > 0);
    }


    function createCopyButton() {
        const button = document.createElement('button');
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            color: 'white',
        });

        button.textContent = 'Copy Tags';

        // Set the button color based on the current site
        const siteConfig = getCurrentSiteConfig();
        if (siteConfig) {
            button.style.backgroundColor = getSiteColor(window.location.hostname);
        }

        button.onmouseover = () => {
            button.style.backgroundColor = darkenColor(button.style.backgroundColor, 0.2);
            button.style.transform = 'scale(1.05)';
        };
        button.onmouseout = () => {
            button.style.backgroundColor = getSiteColor(window.location.hostname);
            button.style.transform = 'scale(1)';
        };

        // Copy tags to clipboard
        button.onclick = () => {
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
                //set the text depending in the state, wait 2 seconds then go back to the original text
                navigator.clipboard.writeText(tagString)
                    .then(() => {
                        button.textContent = `Copied ${beginningPresets.length + tags.length + endPresets.length} tags!`;
                        setTimeout(() => {
                            button.textContent = 'Copy Tags';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy tags:', err);
                        button.textContent = 'Failed to copy';
                        setTimeout(() => {
                            button.textContent = 'Copy Tags';
                        }, 2000);
                    });
            });

        };

        return button;
    }



    function init() {
        const button = createCopyButton();
        document.body.appendChild(button);

        // Shortkey "]"
        document.addEventListener('keyup', (e) => {
            if (e.key === ']') {
                button.click();
            }
        });
    }

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