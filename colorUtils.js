 // few convert functions 
 function hexToRgb(hex) {
     const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
     return result ? {
         r: parseInt(result[1], 16),
         g: parseInt(result[2], 16),
         b: parseInt(result[3], 16)
     } : null;
 }

 function rgbToHsl(r, g, b) {
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
     return {
         h: h * 360,
         s: s * 100,
         l: l * 100
     };
 }


 function hslToRgb(h, s, l) {
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
 }

 function rgbToHex(r, g, b) {
     return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
 }

 function darkenColor(hexColor, amount) {
     const rgb = hexToRgb(hexColor);
     if (!rgb) return hexColor;

     const darkenedR = Math.max(0, rgb.r - (rgb.r * amount));
     const darkenedG = Math.max(0, rgb.g - (rgb.g * amount));
     const darkenedB = Math.max(0, rgb.b - (rgb.b * amount));

     return rgbToHex(darkenedR, darkenedG, darkenedB);
 }
 // for changing the color of the popup based on the site (also the button)
 function adjustSaturationAndLightness(hexColor, saturationChange, lightnessChange) {
     const rgb = hexToRgb(hexColor);
     if (!rgb) return hexColor;
     const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

     const adjustedSaturation = Math.max(0, Math.min(100, hsl.s + saturationChange));
     const adjustedLightness = Math.max(0, Math.min(100, hsl.l + lightnessChange));

     const adjustedRgb = hslToRgb(hsl.h, adjustedSaturation, adjustedLightness);
     return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
 }

 function adjustColor(hexColor, saturationChange, lightnessChange) {
     const rgb = hexToRgb(hexColor);
     if (!rgb) return hexColor;
     const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
     const adjustedSaturation = Math.max(0, Math.min(100, hsl.s + saturationChange));
     const adjustedLightness = Math.max(0, Math.min(100, hsl.l + lightnessChange));
     const adjustedRgb = hslToRgb(hsl.h, adjustedSaturation, adjustedLightness);
     return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
 }

 function generateColorScheme(baseColor) {
     try {
         const rgb = hexToRgb(baseColor);
         if (!rgb) {
             console.error('Invalid base color:', baseColor);
             return DEFAULT_COLOR_SCHEME;
         }
         const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

         return {
             '--primary-color': baseColor,
             '--primary-dark': adjustColor(baseColor, 0, -50), // Darken the primary color
             '--section-bg': adjustSaturationAndLightness(baseColor, -50, 40),
             '--x': adjustSaturationAndLightness(baseColor, -20, -95),
             '--item-hover': adjustSaturationAndLightness(baseColor, -15, 90),
             '--input-bg': adjustSaturationAndLightness(baseColor, -50, 50),
             '--input-border': "#e0e0e0",
             '--text-primary': adjustSaturationAndLightness(baseColor, -10, -20),
             '--delete-btn': '--section-bg',
             '--delete-btn-hover': '#c82333'
         };

     } catch (error) {
         console.error('Error generating color scheme:', error);
         return DEFAULT_COLOR_SCHEME;
     }
 }

 function getSiteColor(hostname) {
     const colors = {
         'rule34.xxx': '#346534', // Rule34 Dark blue
         'e621.net': '#1e88e5', // e621 Blue
         'konachan.com': '#ee8887', // Konachan Pink
         'konachan.net': '#ee8887', // Konachan Pink
         'yande.re': '#ee8887', // Yande.re Pink
         'rule34.paheal.net': '#009', // Paheal Dark blue
         'chan.sankakucomplex.com': '#FF761C', // Sankaku Complex Orange
     };

     return colors[hostname] || '#006ffa'; // Default to blue if no specific color is found
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