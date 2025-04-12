# Booru Tag Copier Extension

This is for copying the tags from multiple booru sites, it  adds a button in the right conner in the supported sites. Its usefull for copying the tags as prompts for stable difussion models.
It also can be used for downloading images along side the tags in a txt file for creating dataset for tranning models.
Be careful if copying any of the links, many of these sites are heavily NSFW 

## Features

*   **Supported Sites:** Includes specific support for:
    *   Gelbooru
    *   Danbooru
    *   Safebooru
    *   Rule34.xxx
    *   e621.net
    *   Konachan.com
    *   Konachan.net
    *   Rule34.paheal.net
    *   Yande.re
    *   TBIB (tbib.org)
    *   Sankaku Complex (chan.sankakucomplex.com)
*   **Generic Booru Support:** Attempts to extract tags from any site with a standard booru tag structure.
*   **Tag Copying:** Copies all extracted tags to your clipboard with one click, combining tags from all selected presets.
*   **Image and Tag Downloading:** Downloads the current image and a corresponding text file containing the extracted tags.
*   **Preset Management:** Create custom presets of tags to be included at the beginning or end of the copied tags.


## How to Use

1.  **Navigate to a Supported Site:** Go to a supported booru website (listed above or any booru with a common tag structure).
2.  **Open a Post:** Open any post containing images and tags.
3.  **Copy Tags:**
    *   Click the "Copy Tags" button added by the extension, or press the `]` key.
    *   The tags will be copied to your clipboard.
4.  **Download Image and Tags:**
    *   Click the "Download" button to download the image and a `.txt` file with the tags, or press the `[` key.
    * **Download button**: You can disable the download button in the settings of the extension's popup.
    * **Tag download**: You can disable the tag download in the settings of the extension's popup, this will make only the image to be downloaded
5.  **Manage Presets:**
    *   Open the extension's popup to create, edit, delete, or reorder your presets.

### Keyboard Shortcuts
*   `[` : Download Image and Tags
*  `]` : Copy Tags

## Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Ritpop/booru-tag-copier-extension/
    ```
    Or download the repository as a ZIP file and extract it to a location of your choice.
2.  **Open Chrome Extensions:** In Chrome, navigate to `chrome://extensions/`.
3.  **Enable Developer Mode:** Turn on "Developer mode" using the toggle switch in the top-right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button and select the `src` directory where you cloned or extracted the repository.

## License

MIT License - See the `LICENSE` file for details.
