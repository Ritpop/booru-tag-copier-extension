(function() {
    // Preset for different sites
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

    function cleanTag(tag) {

        return tag.replace(/[\?]/g, '').replace(/_/g, ' ').trim().toLowerCase();
    }

    function getAllTags(config) {
        const allTags = [];

        if (config.selectors.artists) {
            document.querySelectorAll(config.selectors.artists).forEach(el => {
                allTags.push('creator:' + cleanTag(el.textContent));
            });
        }

        if (config.selectors.characters) {
            document.querySelectorAll(config.selectors.characters).forEach(el => {
                allTags.push('character:' + cleanTag(el.textContent));
            });
        }

        if (config.selectors.copyrights) {
            document.querySelectorAll(config.selectors.copyrights).forEach(el => {
                allTags.push('series:' + cleanTag(el.textContent));
            });
        }

        if (config.selectors.general) {
            document.querySelectorAll(config.selectors.general).forEach(el => {
                allTags.push(cleanTag(el.textContent));
            });
        }

        if (config.selectors.species) {
            document.querySelectorAll(config.selectors.species).forEach(el => {
                allTags.push('species:' + cleanTag(el.textContent));
            });
        }

        if (config.selectors.meta) {
            document.querySelectorAll(config.selectors.meta).forEach(el => {
                allTags.push('meta:' + cleanTag(el.textContent));
            });
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
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'background-color 0.2s ease'
        });

        button.textContent = 'Copy Tags';

        button.onmouseover = () => button.style.backgroundColor = '#0056b3';
        button.onmouseout = () => button.style.backgroundColor = '#007bff';

        button.onclick = () => {
            const config = getCurrentSiteConfig();
            if (config) {
                const tags = getAllTags(config);
                const tagString = tags.join(', ');
                navigator.clipboard.writeText(tagString)
                    .then(() => {
                        button.textContent = `Copied ${tags.length} tags!`;
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
            } else {
                button.textContent = 'Site not supported';
                setTimeout(() => {
                    button.textContent = 'Copy Tags';
                }, 2000);
            }
        };

        return button;
    }

    function init() {
        const button = createCopyButton();
        document.body.appendChild(button);

        //Shortkey "]"
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