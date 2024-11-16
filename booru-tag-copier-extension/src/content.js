(function() {
    // Configuration for different sites
    const siteConfigs = {
        'gelbooru.com': {
            selectors: [
                '.tag-type-artist a',
                '.tag-type-character a',
                '.tag-type-copyright a',
                '.tag-type-general a'
            ]
        },
        'danbooru.donmai.us': {
            selectors: [
                '.tag-type-1 a',
                '.tag-type-4 a',
                '.tag-type-3 a',
                '.tag-type-0 a'
            ]
        },
        'safebooru.org': {
            selectors: [
                '.tag-type-artist a',
                '.tag-type-character a',
                '.tag-type-copyright a',
                '.tag-type-general a'
            ]
        }
    };

    function getCurrentSiteConfig() {
        const hostname = window.location.hostname;
        return siteConfigs[hostname];
    }

    function getAllTags(config) {
        const allTagElements = [];
        config.selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            allTagElements.push(...Array.from(elements));
        });

        return allTagElements
            .map(el => el.textContent.trim())
            .filter(text => text !== '?' && text.length > 0)
            .join(', ');
    }

    function createCopyButton() {
        const button = document.createElement('button');
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: '1000',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        });
        button.textContent = 'Copy Tags';

        // Add hover effect
        button.onmouseover = () => button.style.backgroundColor = '#0056b3';
        button.onmouseout = () => button.style.backgroundColor = '#007bff';

        return button;
    }

    function init() {
        const config = getCurrentSiteConfig();
        if (!config) {
            console.log('Site not supported');
            return;
        }

        const tags = getAllTags(config);
        if (!tags) {
            console.log('No tags found on this page');
            return;
        }

        const copyButton = createCopyButton();
        document.body.appendChild(copyButton);

        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(tags)
                .then(() => {
                    // Create and show a temporary success message
                    const notification = document.createElement('div');
                    Object.assign(notification.style, {
                        position: 'fixed',
                        bottom: '60px',
                        right: '10px',
                        padding: '10px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        borderRadius: '5px',
                        zIndex: '1000',
                        transition: 'opacity 0.5s',
                        opacity: '1'
                    });
                    notification.textContent = 'Tags copied successfully!';
                    document.body.appendChild(notification);

                    // Remove notification after 2 seconds
                    setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => notification.remove(), 500);
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy tags:', err);
                    alert('Failed to copy tags. Check the console for details.');
                });
        });
    }

    // Initialize the extension
    init();
})();