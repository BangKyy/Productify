/**
 * Utility helper to automatically compress and resize uploaded image Files
 * using HTML5 Canvas before converting to lightweight WebP/JPEG Base64 string.
 *
 * @param {File} file - The raw uploaded image File
 * @param {number} maxKB - Target maximum size in Kilobytes (default 100 KB)
 * @param {number} maxDimension - Target maximum width/height dimension in pixels (default 800px)
 * @returns {Promise<{ dataUrl: string, originalSizeKB: number, compressedSizeKB: number }>}
 */
export const compressImageFile = (file, maxKB = 100, maxDimension = 800) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Berkas yang diunggah harus berupa gambar bertipe WebP, JPG, JPEG, atau PNG.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar dari perangkat.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas gambar rusak atau tidak dapat diproses.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding max dimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D Context tidak didukung oleh browser.'));
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Quality compression loop
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/webp', quality);

        // Fallback to image/jpeg if WebP is unsupported
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const targetBytes = maxKB * 1024;
        // Iteratively lower quality until size requirement is met or min threshold (0.15)
        while (dataUrl.length * 0.75 > targetBytes && quality > 0.15) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        }

        const originalKB = Math.round(file.size / 1024);
        const compressedKB = Math.round(dataUrl.length * 0.75 / 1024);

        resolve({
          dataUrl,
          originalSizeKB: originalKB,
          compressedSizeKB: compressedKB
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};
