
import React, { useState } from 'react';
import CropTool from './components/CropTool';
import UnitSelector from './components/UnitSelector';
import { readFileAsDataUrl, isValidImage, getImageDimensions, formatFileSize } from './utils/imageUtils';
import './styles/App.css';

function App() {
  const [image, setImage] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [processedImage, setProcessedImage] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [unit, setUnit] = useState('px');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImage(file)) {
      setError('Please upload a valid image (JPEG, PNG, or WebP)');
      return;
    }

    try {
      setError('');
      const dataUrl = await readFileAsDataUrl(file);
      setImage(dataUrl);
      setProcessedImage(dataUrl);
      
      const dimensions = await getImageDimensions(dataUrl);
      setOriginalDimensions(dimensions);
      
      // Get file size
      const head = 'data:image/jpeg;base64,';
      const size = Math.round((dataUrl.length - head.length) * 3 / 4);
      setFileSize(size);
    } catch (err) {
      setError('Error loading image: ' + err.message);
    }
  };

  const handleCropComplete = (cropArea) => {
    // Crop functionality will be implemented here
    console.log('Crop area:', cropArea);
  };

  const handleCompressComplete = (compressedDataUrl, compressedSize) => {
    setProcessedImage(compressedDataUrl);
    setFileSize(compressedSize);
  };

  const handleClearImage = () => {
    setImage(null);
    setProcessedImage(null);
    setFileSize(0);
    setOriginalDimensions({ width: 0, height: 0 });
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'processed-image.jpg';
    link.href = processedImage;
    link.click();
  };

  const displayDimension = (pixels) => {
    switch (unit) {
      case 'cm':
        return (pixels * 2.54 / 96).toFixed(2) + ' cm';
      case 'in':
        return (pixels / 96).toFixed(2) + ' in';
      case 'px':
      default:
        return pixels + ' px';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src="/croptool_icon.png" alt="Logo" className="app-logo" />
        <div className="header-content">
          <h1>Image Crop & Compress</h1>
          <p>Crop and compress your images with flexible sizing options</p>
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        <div className="upload-section">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            id="file-input"
          />
          <label htmlFor="file-input" className="upload-button">
            Upload Image
          </label>
        </div>

        {image && (
          <>
            <div className="info-section">
              <div className="dimension-info">
                <h3>Dimensions</h3>
                <UnitSelector value={unit} onChange={setUnit} label="Unit:" />
                <p>Width: {displayDimension(originalDimensions.width)}</p>
                <p>Height: {displayDimension(originalDimensions.height)}</p>
              </div>
              <div className="file-info">
                <h3>File Size</h3>
                <p>{formatFileSize(fileSize)}</p>
              </div>
            </div>

            <div className="tools-section">
              <CropTool 
                image={image} 
                onCropComplete={handleCropComplete}
                onClearImage={handleClearImage}
              />
            </div>

            {/* {!showPreview ? (
              <button onClick={() => setShowPreview(true)} className="show-preview-button">
                Show Preview
              </button>
            ) : (
              <div className="preview-section">
                <h3>Preview</h3>
                <img src={processedImage} alt="Preview" />
                <button onClick={handleDownload} className="download-button">
                  Download Image
                </button>
                <button onClick={() => setShowPreview(false)} className="hide-preview-button">
                  Hide Preview
                </button>
              </div>
            )} */}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
