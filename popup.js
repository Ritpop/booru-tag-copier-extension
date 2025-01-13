const DEFAULT_COLOR_SCHEME = {
    '--primary-color': '#006ffa',
    '--primary-dark': '#0056cc',
    '--section-bg': '#f8f9fa',
    '--item-bg': '#ffffff',
    '--item-hover': '#f0f0f0',
    '--input-bg': '#ffffff',
    '--input-border': '#ced4da',
    '--text-primary': '#212529',
    '--delete-btn': '#dc3545',
    '--delete-btn-hover': '#c82333'
};


function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
// worked on this a few days ago and forgot to doc, so now i dont remenber exacly what i did here...
document.getElementById('save-preset').addEventListener('click', () => {
    const name = document.getElementById('preset-name').value;
    const tagsInput = document.getElementById('preset-tags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (!name || tags.length === 0) {
        alert("Please provide a preset name and tags.");
        return;
    }

    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];

        const existingPresetIndex = presets.findIndex(p => p.name === name);

        if (existingPresetIndex !== -1) {
            presets[existingPresetIndex] = {
                id: presets[existingPresetIndex].id,
                name,
                tags,
                selected: presets[existingPresetIndex].selected,
                position: presets[existingPresetIndex].position || 'end'
            };
        } else {
            presets.push({
                id: generateUniqueId(),
                name,
                tags,
                selected: false,
                position: 'end'
            });
        }

        chrome.storage.local.set({ presets }, () => {
            document.getElementById('preset-name').value = '';
            document.getElementById('preset-tags').value = '';

            loadPresets();
        });
    });
});


function loadPresets() {
    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];
        const presetList = document.getElementById('preset-list');
        presetList.innerHTML = '';

        presets.forEach(preset => {
            const presetItem = document.createElement('div');
            presetItem.className = 'preset-item';
            presetItem.draggable = true;
            presetItem.dataset.id = preset.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = preset.selected;
            checkbox.dataset.id = preset.id;


            const positionSelect = document.createElement('select');
            positionSelect.className = 'preset-position';
            ['beginning', 'end'].forEach(pos => {
                const option = document.createElement('option');
                option.value = pos;
                option.textContent = pos.charAt(0).toUpperCase() + pos.slice(1);
                option.selected = preset.position === pos;
                positionSelect.appendChild(option);
            });

            positionSelect.onchange = () => {
                updatePresetProperty(preset.id, 'position', positionSelect.value);
            };

            const label = document.createElement('span');
            label.textContent = `${preset.name} (${preset.tags.length} tags)`;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => deletePreset(preset.id);

            checkbox.onchange = () => {
                updatePresetProperty(preset.id, 'selected', checkbox.checked);
            };

            presetItem.addEventListener('dragstart', handleDragStart);
            presetItem.addEventListener('dragover', handleDragOver);
            presetItem.addEventListener('drop', handleDrop);
            presetItem.addEventListener('dragend', handleDragEnd);

            presetItem.appendChild(checkbox);
            presetItem.appendChild(positionSelect);
            presetItem.appendChild(label);
            presetItem.appendChild(deleteBtn);

            presetList.appendChild(presetItem);
        });
    });
}

let draggedItem = null;
let targetItem = null;

function handleDragStart(e) {
    draggedItem = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    targetItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    const target = e.target.closest('.preset-item');
    if (target && target !== draggedItem) {
        targetItem = target;
        target.style.border = '2px dashed #5c6bc0'; // Add a dashed border to indicate where it will be dropped
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (targetItem && targetItem !== draggedItem) {
        const presetList = document.getElementById('preset-list');
        presetList.insertBefore(draggedItem, targetItem); // Move the dragged item before the target item
        savePresetOrder();
    }

    if (targetItem) {
        targetItem.style.border = ''; // Remove the dashed border after dropping
    }
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    if (targetItem) {
        targetItem.style.border = ''; // Remove the dashed border
    }
    draggedItem = null;
    targetItem = null;
}

function savePresetOrder() {
    const presetList = document.getElementById('preset-list');
    const presetItems = Array.from(presetList.children);

    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];
        const newPresets = presetItems.map(item => {
            const preset = presets.find(p => p.id === item.dataset.id);
            return preset;
        }).filter(preset => preset);

        chrome.storage.local.set({ presets: newPresets });
    });
}

function updatePresetProperty(presetId, property, value) {
    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];
        const updatedPresets = presets.map(preset =>
            preset.id === presetId ? {...preset, [property]: value } : preset
        );
        chrome.storage.local.set({ presets: updatedPresets });
    });
}


function deletePreset(presetId) {
    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];
        const updatedPresets = presets.filter(preset => preset.id !== presetId);

        chrome.storage.local.set({ presets: updatedPresets }, () => {
            loadPresets();
        });
    });
}


function initializeColors() {
    console.log('Initializing colors...');
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        console.log('Current tabs:', tabs);

        if (tabs[0] && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                const hostname = url.hostname;
                console.log('Current hostname:', hostname);



                const baseColor = getSiteColor(hostname);
                console.log('Selected base color:', baseColor);

                const colorScheme = generateColorScheme(baseColor);
                applyColorScheme(colorScheme);
            } catch (error) {
                console.error('Error processing URL:', error);
                applyColorScheme(DEFAULT_COLOR_SCHEME);
            }
        } else {
            console.log('No active tab found, using default colors');
            applyColorScheme(DEFAULT_COLOR_SCHEME);
        }
    });
}
// Load settings from storage and set checkboxes
function loadSettings() {
    chrome.storage.local.get({
        enableDownloadButton: true,
        enableDownloadTags: true
    }, (items) => {
        document.getElementById('enable-download-button').checked = items.enableDownloadButton;
        document.getElementById('enable-download-tags').checked = items.enableDownloadTags;
    });
}

// Function to save settings to storage when changed
function saveSettings() {
    const enableDownloadButton = document.getElementById('enable-download-button').checked;
    const enableDownloadTags = document.getElementById('enable-download-tags').checked;

    chrome.storage.local.set({
        enableDownloadButton,
        enableDownloadTags
    });
    sendMessageToContentScript({
        action: 'updateSettings',
        enableDownloadButton,
        enableDownloadTags
    });
}

// Function to send message to content.js
function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs && tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup loaded, initializing...');
    initializeColors();
    loadPresets();
    loadSettings(); // Load the settings when the popup is opened

    // Event listeners for checkboxes
    document.getElementById('enable-download-button').addEventListener('change', saveSettings);
    document.getElementById('enable-download-tags').addEventListener('change', saveSettings);
});