// Image utility functions for cropping and compression

/**
 * Converts pixels to centimeters (assuming 96 DPI)
 * @param {number} pixels - The pixel value
 * @returns {number} The value in centimeters
 */
export const pixelsToCm = (pixels) => {
  return pixels * 2.54 / 96;
};

/**
 * Converts pixels to inches (assuming 96 DPI)
 * @param {number} pixels - The pixel value
 * @returns {number} The value in inches
 */
export const pixelsToInches = (pixels) => {
  return pixels / 96;
};

/**
 * Converts centimeters to pixels (assuming 96 DPI)
 * @param {number} cm - The centimeter value
 * @returns {number} The value in pixels
 */
export const cmToPixels = (cm) => {
  return cm * 96 / 2.54;
};

/**
 * Converts inches to pixels (assuming 96 DPI)
 * @param {number} inches - The inch value
 * @returns {number} The value in pixels
 */
export const inchesToPixels = (inches) => {
  return inches * 96;
};

/**
 * Converts a value to the specified unit
 * @param {number} value - The value in pixels
 * @param {string} unit - The target unit ('px', 'cm', or 'in')
 * @returns {number} The converted value
 */
export const convertUnit = (value, unit) => {
  switch (unit) {
    case 'cm':
      return pixelsToCm(value);
    case 'in':
      return pixelsToInches(value);
    case 'px':
    default:
      return value;
  }
};

/**
 * Formats file size to human readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets image dimensions from a data URL
 * @param {string} dataUrl - The image data URL
 * @returns {Promise<{width: number, height: number}>} Promise with dimensions
 */
export const getImageDimensions = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

/**
 * Crops an image based on the given crop area
 * @param {string} imageSrc - The source image URL
 * @param {Object} cropArea - The crop area {x, y, width, height}
 * @returns {Promise<string>} Promise with the cropped image data URL
 */
export const cropImage = (imageSrc, cropArea) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * Compresses an image with the specified quality
 * @param {string} imageSrc - The source image URL
 * @param {number} quality - The compression quality (1-100)
 * @returns {Promise<{dataUrl: string, size: number}>} Promise with compressed image data and size
 */
export const compressImage = (imageSrc, quality) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      
      // Calculate approximate file size
      const head = 'data:image/jpeg;base64,';
      const size = Math.round((dataUrl.length - head.length) * 3 / 4);
      
      resolve({ dataUrl, size });
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * Validates if the file is a valid image type
 * @param {File} file - The file to validate
 * @returns {boolean} True if valid image type
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Reads a file as a data URL
 * @param {File} file - The file to read
 * @returns {Promise<string>} Promise with the data URL
 */
export const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
