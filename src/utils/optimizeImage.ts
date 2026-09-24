const MAX_DIMENSION = 960;
const TARGET_BYTES = 350 * 1024;

function encodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob || blob.type !== 'image/webp') {
                reject(new Error('Este navegador não conseguiu converter a imagem para WebP.'));
                return;
            }
            resolve(blob);
        }, 'image/webp', quality);
    });
}

export async function optimizeImage(file: File): Promise<File> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Use uma imagem JPG, PNG ou WebP.');
    }

    // Preserve already small images without recompression.
    if (file.size <= TARGET_BYTES) return file;

    const bitmap = await createImageBitmap(file);
    try {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Não foi possível preparar a imagem.');
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        let result = await encodeWebp(canvas, 0.78);
        if (result.size > TARGET_BYTES) result = await encodeWebp(canvas, 0.62);
        if (result.size > TARGET_BYTES) {
            const smaller = document.createElement('canvas');
            const ratio = Math.min(1, 720 / Math.max(canvas.width, canvas.height));
            smaller.width = Math.max(1, Math.round(canvas.width * ratio));
            smaller.height = Math.max(1, Math.round(canvas.height * ratio));
            smaller.getContext('2d')?.drawImage(canvas, 0, 0, smaller.width, smaller.height);
            result = await encodeWebp(smaller, 0.58);
        }
        if (result.size >= file.size) return file;

        const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
        return new File([result], name, { type: 'image/webp' });
    } finally {
        bitmap.close();
    }
}
