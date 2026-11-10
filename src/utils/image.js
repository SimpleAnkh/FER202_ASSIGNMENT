const maxSourceImageSize = 2 * 1024 * 1024;
const maxDataUrlLength = 72 * 1024;
const maxImageDimension = 1200;

export function readOptimizedImage(file) {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Vui lòng chọn tệp hình ảnh hợp lệ.'));
  }
  if (file.size > maxSourceImageSize) {
    return Promise.reject(new Error('Ảnh cần nhỏ hơn 2MB.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc ảnh này. Vui lòng chọn ảnh khác.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Không thể mở ảnh này. Vui lòng chọn ảnh khác.'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Trình duyệt không hỗ trợ xử lý ảnh.'));
          return;
        }

        let scale = Math.min(1, maxImageDimension / Math.max(image.naturalWidth, image.naturalHeight));
        while (scale > 0) {
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          context.fillStyle = '#fff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          for (let quality = 0.85; quality >= 0.35; quality -= 0.1) {
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            if (dataUrl.length <= maxDataUrlLength) {
              resolve(dataUrl);
              return;
            }
          }

          scale *= 0.8;
        }

        reject(new Error('Không thể nén ảnh xuống dung lượng cho phép. Vui lòng chọn ảnh khác.'));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
