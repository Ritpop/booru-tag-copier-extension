var TagCopierConfig = (function() {
    //Presets for the html tags of the sites. 
    const selectorPresets = {
        'booruTagList': {
            artists: '#tag_list .tag-type-artist a',
            characters: '#tag_list .tag-type-character a',
            copyrights: '#tag_list .tag-type-copyright a',
            general: '#tag_list .tag-type-general a',
            meta: '#tag_list .tag-type-meta a'
        },
        'booruTagListLi': {
            artists: '#tag_list li.tag-type-1 a.search-tag',
            characters: '#tag_list li.tag-type-4 a.search-tag',
            copyrights: '#tag_list li.tag-type-3 a.search-tag',
            general: '#tag_list li.tag-type-0 a.search-tag',
            meta: '#tag_list li.tag-type-5 a.search-tag'
        },
        'sidebarTags': {
            artists: '#tag-sidebar .tag-type-artist a',
            characters: '#tag-sidebar .tag-type-character a',
            copyrights: '#tag-sidebar .tag-type-copyright a',
            general: '#tag-sidebar .tag-type-general a',
            meta: '#tag-sidebar .tag-type-metadata a'
        },
        'listTags': {
            artists: 'li.tag-type-artist a',
            characters: 'li.tag-type-character a',
            copyrights: 'li.tag-type-copyright a',
            general: 'li.tag-type-general a'
        },
        'artistList': {
            artists: '.artist-tag-list a'
        },
        'characterList': {
            characters: '.character-tag-list a'
        },
        'copyrightList': {
            copyrights: '.copyright-tag-list a'
        },
        'generalList': {
            general: '.general-tag-list a'
        },
        'speciesList': {
            species: '.species-tag-list a'
        },
        'sankakuSidebar': {
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
        },
        'pahealTags': {
            general: 'table.tag_list td.tag_name_cell a'
        },
        'tbibTags': {
            general: '#tag-sidebar li a'
        },
        'fallbackTags': [
            '#tag_list a',
            '#tag_list li a',
            '#tag-sidebar li a',
            '.tag-list li a',
            '.tags-container a',
            '[class*="tag-type"] a',
            '[class*="tag"] a'
        ]
    };

    function createSiteConfig(preset) {
        return { selectors: preset };
    }

    function createSiteConfigWithOverrides(preset, overrides) {
        return { selectors: {...preset, ...overrides } };
    }
    // Select the preset for each site, if needded add a new preset.
    const siteConfigs = {
        'gelbooru.com': createSiteConfig(selectorPresets.booruTagLi),
        'danbooru.donmai.us': createSiteConfig(selectorPresets.booruTagListLi),
        'safebooru.org': createSiteConfigWithOverrides(selectorPresets.sidebarTags, { artists: null }),
        'rule34.xxx': createSiteConfig(selectorPresets.listTags),
        'e621.net': createSiteConfigWithOverrides(selectorPresets.generalList, {
            ...selectorPresets.artistList,
            ...selectorPresets.characterList,
            ...selectorPresets.copyrightList,
            ...selectorPresets.speciesList
        }),
        'konachan.com': createSiteConfig(selectorPresets.listTags),
        'konachan.net': createSiteConfig(selectorPresets.listTags),
        'yande.re': createSiteConfig(selectorPresets.listTags),
        'tbib.org': createSiteConfig(selectorPresets.tbibTags),
        'chan.sankakucomplex.com': createSiteConfig(selectorPresets.sankakuSidebar),
        'rule34.paheal.net': createSiteConfig(selectorPresets.pahealTags)

    };

    // I separeted the generic Booru selectors because i was facing a few problems but i plan in add then in a single one later. not really looking into it now because i want to make the download function.

    const genericBooruSelectors = {
        artists: [
            selectorPresets.booruTagList.artists,
            '#tag_list li[class*="artist"] a',
            '.tag-type-artist a',
            '.tag-type-1 a',
            'li.tag-type-artist a',
            '#tag-list li.tag-type-1 a.search-tag',
            '.artist-tag-list a'
        ],
        characters: [
            selectorPresets.booruTagList.characters,
            '#tag_list li[class*="character"] a',
            '.tag-type-character a',
            '.tag-type-4 a',
            'li.tag-type-character a',
            '#tag-list li.tag-type-4 a.search-tag',
            '.character-tag-list a'
        ],
        copyrights: [
            selectorPresets.booruTagList.copyrights,
            '#tag_list li[class*="copyright"] a',
            '.tag-type-copyright a',
            '.tag-type-3 a',
            'li.tag-type-copyright a',
            '#tag-list li.tag-type-3 a.search-tag',
            '.copyright-tag-list a'
        ],
        general: [
            selectorPresets.booruTagList.general,
            '#tag_list li[class*="general"] a',
            '.tag-type-general a',
            '.tag-type-0 a',
            'li.tag-type-general a',
            '#tag-list li.tag-type-0 a.search-tag',
            '.general-tag-list a'
        ],
        meta: [
            selectorPresets.booruTagList.meta,
            '#tag_list li[class*="meta"] a',
            '.tag-type-meta a',
            '.tag-type-5 a',
            'li.tag-type-meta a',
            '#tag-list li.tag-type-5 a.search-tag',
            '.meta-tag-list a'
        ],
        fallback: selectorPresets.fallbackTags
    };


    return {
        siteConfigs: siteConfigs,
        genericBooruSelectors: genericBooruSelectors
    };
})();

function getImageUrl() {
    const hostname = window.location.hostname;
    const imageSelectors = {
        'rule34.xxx': '#image',
        'e621.net': '#image',
        'konachan.com': '#image',
        'konachan.net': '#image',
        'yande.re': '#image',
        'rule34.paheal.net': '#main_image',
        'gelbooru.com': '#image',
        'danbooru.donmai.us': '#image',
        'safebooru.org': '#image',
        'chan.sankakucomplex.com': '#post-content img',
        'tbib.org': '#image'
    };

    const selector = imageSelectors[hostname] || '#image';
    const imageElement = document.querySelector(selector);
    return imageElement ? imageElement.src : null;
}
//I am not really sure if making a gigantic function to return the selectors are a good idea, but i hadnt much trouble with it so...