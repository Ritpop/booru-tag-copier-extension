(function() {
    // clean and format the tags
    function cleanTag(tag) {
        return tag.replace(/[\?]/g, '').replace(/_/g, ' ').trim().toLowerCase();
    }


    function loadPresets(callback) {
        chrome.storage.local.get('presets', (data) => {
            const presets = data.presets || [];
            callback(presets);
        });
    }

    // Get the configuration for the current site based on hostname, these are html tags of the sites
    const siteConfigs = {
        'gelbooru.com': {
            selectors: {
                artists: '.tag-type-artist a',
                characters: '.tag-type-character a',
                copyrights: '.tag-type-copyright a',
                general: '.tag-type-general a'
            }
        },
        'danbooru.donmai.us': {
            selectors: {
                artists: '#tag-list li.tag-type-1 a.search-tag',
                characters: '#tag-list li.tag-type-4 a.search-tag',
                copyrights: '#tag-list li.tag-type-3 a.search-tag',
                general: '#tag-list li.tag-type-0 a.search-tag',
                meta: '#tag-list li.tag-type-5 a.search-tag'
            }
        },
        'safebooru.org': {
            selectors: {
                artists: null,
                characters: '#tag-sidebar .tag-type-character a',
                copyrights: '#tag-sidebar .tag-type-copyright a',
                general: '#tag-sidebar .tag-type-general a',
                meta: '#tag-sidebar .tag-type-metadata a'
            }
        },
        'rule34.xxx': {
            selectors: {
                artists: 'li.tag-type-artist a',
                characters: 'li.tag-type-character a',
                copyrights: 'li.tag-type-copyright a',
                general: 'li.tag-type-general a'
            }
        },
        'e621.net': {
            selectors: {
                artists: '.artist-tag-list a',
                characters: '.character-tag-list a',
                copyrights: '.copyright-tag-list a',
                general: '.general-tag-list a',
                species: '.species-tag-list a'
            }
        },
        'konachan.com': {
            selectors: {
                artists: 'li.tag-type-artist a',
                characters: 'li.tag-type-character a',
                copyrights: 'li.tag-type-copyright a',
                general: 'li.tag-type-general a'
            }
        },
        'konachan.net': {
            selectors: {
                artists: 'li.tag-type-artist a',
                characters: 'li.tag-type-character a',
                copyrights: 'li.tag-type-copyright a',
                general: 'li.tag-type-general a'
            }
        },
        'yande.re': {
            selectors: {
                artists: 'li.tag-type-artist a',
                characters: 'li.tag-type-character a',
                copyrights: 'li.tag-type-copyright a',
                general: 'li.tag-type-general a'
            }
        },
        'tbib.org': {
            selectors: {
                general: '#tag-sidebar li a'
            }
        },
        'chan.sankakucomplex.com': {
            selectors: {
                artists: '#tag-sidebar .tag-type-artist a.tag-link',
                copyrights: '#tag-sidebar .tag-type-copyright a.tag-link',
                characters: '#tag-sidebar .tag-type-character a.tag-link',
                fashion: '#tag-sidebar .tag-type-fashion a.tag-link',
                anatomy: '#tag-sidebar .tag-type-anatomy a.tag-link',
                pose: '#tag-sidebar .tag-type-pose a.tag-link',
                activity: '#tag-sidebar .tag-type-activity a.tag-link',
                object: '#tag-sidebar .tag-type-object a.tag-link',
                substance: '#tag-sidebar .tag-type-substance a.tag-link',
                setting: '#tag-sidebar .tag-type-setting a.tag-link',
                medium: '#tag-sidebar .tag-type-medium a.tag-link',
                automatic: '#tag-sidebar .tag-type-automatic a.tag-link'
            }
        },
        'rule34.paheal.net': {
            selectors: {
                general: 'table.tag_list td.tag_name_cell a'
            }
        }
    };

    function getCurrentSiteConfig() {
        const hostname = window.location.hostname;
        return siteConfigs[Object.keys(siteConfigs).find(key => hostname.includes(key))];
    }

    function getAllTags(config) {
        const allTags = [];

        // Loop through each tag category in the config
        Object.keys(config.selectors).forEach(category => {
            if (config.selectors[category]) {
                document.querySelectorAll(config.selectors[category]).forEach(el => {
                    const cleanTagText = cleanTag(el.textContent);
                    if (cleanTagText) {
                        allTags.push(cleanTagText); // Add tag without category prefix
                    }
                });
            }
        });

        return allTags.filter(tag => tag && tag.length > 0); // remove empty or invalid tags
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

        // Click event to copy tags to clipboard
        button.onclick = () => {
            const config = getCurrentSiteConfig();
            if (config) {
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
            } else {
                button.textContent = 'Site not supported';
                setTimeout(() => {
                    button.textContent = 'Copy Tags';
                }, 2000);
            }
        };

        return button;
    }

    function getSiteColor(hostname) {
        const colors = {
            'rule34.xxx': '#009', // Rule34 Dark blue
            'e621.net': '#1e88e5', // e621 Blue
            'konachan.com': '#ee8887', // Konachan Pink
            'konachan.net': '#ee8887', // Konachan Pink
            'yande.re': '#ee8887', // Yande.re Pink
            'rule34.paheal.net': '#009', // Paheal Dark blue
            'chan.sankakucomplex.com': '#FF761C', // Sankaku Complex Orange
        };

        return colors[hostname] || '#006ffa'; // Default to blue if no specific color is found
    }

    function darkenColor(color, amount) {
        let colorHex = color.replace('#', '');
        let r = parseInt(colorHex.substring(0, 2), 16);
        let g = parseInt(colorHex.substring(2, 4), 16);
        let b = parseInt(colorHex.substring(4, 6), 16);

        r = Math.max(0, r - (r * amount));
        g = Math.max(0, g - (g * amount));
        b = Math.max(0, b - (b * amount));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
})();