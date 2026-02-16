import React, { useState } from 'react';
import './CompressTool.css';

const CompressTool = ({ image, originalSize, onCompressComplete }) => {
  const [quality, setQuality] = useState(80);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleQualityChange = (e) => {
    setQuality(parseInt(e.target.value));
  };

  const handleCompress = () => {
    if (!image) return;

    const img = new Image();
    img.src = image;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Compress the image
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setCompressedImage(compressedDataUrl);
      
      // Calculate sizes (approximate)
      const head = 'data:image/jpeg;base64,';
      const size = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
      setCompressedSize(size);
      
      if (onCompressComplete) {
        onCompressComplete(compressedDataUrl, size);
      }
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="compress-tool">
      <h2>Compress Image</h2>
      <div className="compress-controls">
        <label htmlFor="quality">Quality: {quality}%</label>
        <input
          type="range"
          id="quality"
          name="quality"
          min="1"
          max="100"
          value={quality}
          onChange={handleQualityChange}
        />
      </div>
      <button onClick={handleCompress} disabled={!image}>
        Compress Image
      </button>
      
      {compressedImage && (
        <div className="compress-result">
          <h3>Compressed Image</h3>
          <img src={compressedImage} alt="Compressed" />
          <p>Original Size: {originalSize ? formatFileSize(originalSize) : 'N/A'}</p>
          <p>Compressed Size: {formatFileSize(compressedSize)}</p>
          <a href={compressedImage} download="compressed-image.jpg">
            <button>Download</button>
          </a>
        </div>
      )}
    </div>
  );
};

export default CompressTool;
