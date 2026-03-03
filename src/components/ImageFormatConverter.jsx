import React, { useState } from 'react';
import { readFileAsDataUrl, isValidImage, getImageDimensions, formatFileSize } from '../utils/imageUtils';
import './ImageFormatConverter.css';

const ImageFormatConverter = () => {
  const [image, setImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [targetFormat, setTargetFormat] = useState('jpeg');
  const [quality, setQuality] = useState(90);
  const [convertedImage, setConvertedImage] = useState(null);
  const [convertedSize, setConvertedSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const imageFormats = [
    { value: 'jpeg', label: 'JPEG', extension: '.jpg', mimeType: 'image/jpeg' },
    { value: 'png', label: 'PNG', extension: '.png', mimeType: 'image/png' },
    { value: 'webp', label: 'WebP', extension: '.webp', mimeType: 'image/webp' },
    { value: 'gif', label: 'GIF', extension: '.gif', mimeType: 'image/gif' },
    { value: 'bmp', label: 'BMP', extension: '.bmp', mimeType: 'image/bmp' },
    { value: 'tiff', label: 'TIFF', extension: '.tiff', mimeType: 'image/tiff' }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImage(file)) {
      setError('Please upload a valid image (JPEG, PNG, WebP, GIF, BMP, or TIFF)');
      return;
    }

    try {
      setError('');
      const dataUrl = await readFileAsDataUrl(file);
      setImage(dataUrl);
      setOriginalSize(file.size);
      setConvertedImage(null);
      setConvertedSize(0);
    } catch (err) {
      setError('Error loading image: ' + err.message);
    }
  };

  const handleConvert = () => {
    if (!image) return;

    setIsProcessing(true);
    setError('');

    const img = new Image();
    img.src = image;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Get the selected format
      const selectedFormat = imageFormats.find(f => f.value === targetFormat);
      const mimeType = selectedFormat ? selectedFormat.mimeType : 'image/jpeg';
      
      // For formats that don't support quality, use 1
      const qualityValue = (targetFormat === 'png' || targetFormat === 'gif' || targetFormat === 'bmp' || targetFormat === 'tiff') 
        ? undefined 
        : quality / 100;
      
      // Convert the image
      const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue);
      setConvertedImage(convertedDataUrl);
      
      // Calculate approximate file size
      const head = `data:${mimeType};base64,`;
      const size = Math.round((convertedDataUrl.length - head.length) * 3 / 4);
      setConvertedSize(size);
      
      setIsProcessing(false);
    };

    img.onerror = () => {
      setError('Error converting image');
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    if (!convertedImage) return;
    
    const selectedFormat = imageFormats.find(f => f.value === targetFormat);
    const extension = selectedFormat ? selectedFormat.extension : '.jpg';
    
    const link = document.createElement('a');
    link.download = `converted-image${extension}`;
    link.href = convertedImage;
    link.click();
  };

  const getFileName = () => {
    if (!image) return 'image';
    // Try to extract original name from data URL or just use generic name
    return 'image';
  };

  return (
    <article className="image-format-converter" aria-labelledby="converter-title">
      <h2 id="converter-title">Convert Image Format</h2>
      <p className="tool-description">
        Convert your images between different formats (JPEG, PNG, WebP, GIF, BMP, TIFF)
      </p>

      {error && <div className="error-message" role="alert">{error}</div>}

      <div className="upload-section">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
          onChange={handleFileUpload}
          id="format-file-input"
          className="visually-hidden"
        />
        <label htmlFor="format-file-input" className="upload-button">
          Upload Image
        </label>
        {image && <p className="file-name" aria-live="polite">File loaded successfully!</p>}
      </div>

      {image && (
        <div className="conversion-options" role="group" aria-label="Conversion settings">
          <fieldset className="format-selection">
            <legend><h3>Target Format</h3></legend>
            <div className="format-grid">
              {imageFormats.map((format) => (
                <label 
                  key={format.value} 
                  className={targetFormat === format.value ? 'selected' : ''}
                  htmlFor={`format-${format.value}`}
                >
                  <input
                    type="radio"
                    id={`format-${format.value}`}
                    name="targetFormat"
                    value={format.value}
                    checked={targetFormat === format.value}
                    onChange={(e) => setTargetFormat(e.target.value)}
                  />
                  <span className="format-label">{format.label}</span>
                  <span className="format-ext">{format.extension}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {targetFormat !== 'png' && targetFormat !== 'gif' && targetFormat !== 'bmp' && targetFormat !== 'tiff' && (
            <div className="quality-selection">
              <label htmlFor="quality">Quality: {quality}%</label>
              <input
                type="range"
                id="quality"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                aria-valuemin="1"
                aria-valuemax="100"
                aria-valuenow={quality}
                aria-label={`Image quality: ${quality}%`}
              />
            </div>
          )}

          <button 
            onClick={handleConvert} 
            disabled={isProcessing}
            className="convert-button"
            aria-describedby="convert-status"
          >
            {isProcessing ? 'Converting...' : 'Convert Image'}
          </button>
          <span id="convert-status" className="visually-hidden">
            {isProcessing ? 'Converting your image, please wait...' : ''}
          </span>
        </div>
      )}

      {convertedImage && (
        <div className="result-section" aria-live="polite">
          <h3>Conversion Complete!</h3>
          <div className="preview-container">
            <img 
              src={convertedImage} 
              alt={`Converted image in ${targetFormat.toUpperCase()} format`} 
            />
          </div>
          <dl className="size-info">
            <div className="size-item">
              <dt>Original Size:</dt>
              <dd>{formatFileSize(originalSize)}</dd>
            </div>
            <div className="size-item">
              <dt>Converted Size:</dt>
              <dd>{formatFileSize(convertedSize)}</dd>
            </div>
          </dl>
          <button onClick={handleDownload} className="download-button">
            Download Converted Image
          </button>
        </div>
      )}
    </article>
  );
};

export default ImageFormatConverter;
