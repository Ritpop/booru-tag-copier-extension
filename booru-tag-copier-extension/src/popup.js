function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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
                updatePresetPosition(preset.id, positionSelect.value);
            };

            const label = document.createElement('span');
            label.textContent = `${preset.name} (${preset.tags.length} tags)`;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => deletePreset(preset.id);

            checkbox.onchange = () => {
                updatePresetSelection(preset.id, checkbox.checked);
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

function updatePresetPosition(presetId, position) {
    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];
        const updatedPresets = presets.map(preset =>
            preset.id === presetId ? {...preset, position } : preset
        );

        chrome.storage.local.set({ presets: updatedPresets });
    });
}

function updatePresetSelection(presetId, isSelected) {
    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];
        const updatedPresets = presets.map(preset =>
            preset.id === presetId ? {...preset, selected: isSelected } : preset
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

function generateColorScheme(baseColor) {
    // Convert hex to RGB for manipulation
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Convert RGB to HSL
    const rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    };

    // Convert HSL to RGB
    const hslToRgb = (h, s, l) => {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };

    // Convert RGB to hex
    const rgbToHex = (r, g, b) => {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    try {
        const rgb = hexToRgb(baseColor);
        if (!rgb) {
            console.error('Invalid base color:', baseColor);
            return getDefaultColorScheme();
        }
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        // Must be a way to make this better or simpler
        // Generate color variations
        return {
            '--primary-color': baseColor,
            '--primary-dark': rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, hsl.l - 10))),
            '--section-bg': rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s - 30, 97))),
            '--item-bg': rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s - 20, 95))),
            '--item-hover': rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s - 15, 90))),
            '--input-bg': '#ffffff',
            '--input-border': rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s - 20, 85))),
            '--text-primary': rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s - 10, 20))),
            '--delete-btn': '#dc3545',
            '--delete-btn-hover': '#c82333'
        };
    } catch (error) {
        console.error('Error generating color scheme:', error);
        return getDefaultColorScheme();
    }
}

function getDefaultColorScheme() {
    return {
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
}

function applyColorScheme(scheme) {
    try {
        Object.entries(scheme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        console.log('Color scheme applied successfully:', scheme);
    } catch (error) {
        console.error('Error applying color scheme:', error);
    }
}

function initializeColors() {
    console.log('Initializing colors...');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Current tabs:', tabs);

        if (tabs[0] && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                const hostname = url.hostname;
                console.log('Current hostname:', hostname);

                const colors = {
                    'rule34.xxx': '#009',
                    'e621.net': '#1e88e5',
                    'konachan.com': '#ee8887',
                    'konachan.net': '#ee8887',
                    'yande.re': '#ee8887',
                    'rule34.paheal.net': '#009',
                    'chan.sankakucomplex.com': '#FF761C',
                };

                const baseColor = colors[hostname] || '#006ffa';
                console.log('Selected base color:', baseColor);

                const colorScheme = generateColorScheme(baseColor);
                applyColorScheme(colorScheme);
            } catch (error) {
                console.error('Error processing URL:', error);
                applyColorScheme(getDefaultColorScheme());
            }
        } else {
            console.log('No active tab found, using default colors');
            applyColorScheme(getDefaultColorScheme());
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup loaded, initializing...');
    initializeColors();
    loadPresets();
});
loadPresets();