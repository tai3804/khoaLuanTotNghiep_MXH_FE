import { Font } from '@react-pdf/renderer';

let isRobotoRegistered = false;

function resolveAssetUrl(path: string) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${normalizedBaseUrl}${path}`;
}

export function registerPdfRobotoFont() {
    if (isRobotoRegistered) return;

    Font.register({
        family: 'Roboto',
        fonts: [
            { src: resolveAssetUrl('fonts/Roboto/static/Roboto-Regular.ttf'), fontWeight: 400 },
            { src: resolveAssetUrl('fonts/Roboto/static/Roboto-Bold.ttf'), fontWeight: 700 },
            { src: resolveAssetUrl('fonts/Roboto/static/Roboto-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
        ],
    });

    isRobotoRegistered = true;
}
