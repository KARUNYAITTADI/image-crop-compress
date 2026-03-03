import React, { useState, useRef, useEffect } from 'react';
import './CropTool.css';

const CropTool = ({ image, onCropComplete, onClearImage }) => {
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [unit, setUnit] = useState('px');
  const [quality, setQuality] = useState(80);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayedDimensions, setDisplayedDimensions] = useState({ width: 0, height: 0 });
  const [compressedSize, setCompressedSize] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // DPI for conversion (assuming 96 DPI)
  const DPI = 96;

// Get original image dimensions when image changes
  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.src = image;
    
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      
      // Calculate original size (approximate from base64)
      const head = 'data:image/jpeg;base64,';
      const size = Math.round((image.length - head.length) * 3 / 4);
      setOriginalSize(size);
      
      // Initialize crop area with full image dimensions as default
      setCropArea({
        x: 0,
        y: 0,
        width: img.width,
        height: img.height
      });
      setCropWidth(fromPixels(img.width, unit));
      setCropHeight(fromPixels(img.height, unit));
    };
  }, [image]);

  // Update compressed size when quality or crop area changes
  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.src = image;
    
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
      
      // Apply compression quality
      const croppedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      
      // Calculate compressed size
      const head = 'data:image/jpeg;base64,';
      const size = Math.round((croppedDataUrl.length - head.length) * 3 / 4);
      setCompressedSize(size);
    };
  }, [quality, cropArea, image]);

  // Track displayed image dimensions
  useEffect(() => {
    if (!imageRef.current) return;
    
    const updateDisplayedDimensions = () => {
      if (imageRef.current) {
        setDisplayedDimensions({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight
        });
      }
    };
    
    updateDisplayedDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDisplayedDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDisplayedDimensions);
    };
  }, [image, imageDimensions.width, imageDimensions.height]);

  // Calculate scaling ratio
  const scaleX = imageDimensions.width > 0 ? displayedDimensions.width / imageDimensions.width : 1;
  const scaleY = imageDimensions.height > 0 ? displayedDimensions.height / imageDimensions.height : 1;

  // Convert to pixels
  const toPixels = (value, unit) => {
    switch (unit) {
      case 'cm':
        return Math.round(value * DPI / 2.54);
      case 'in':
        return Math.round(value * DPI);
      case 'px':
      default:
        return Math.round(value);
    }
  };

  // Convert from pixels
  const fromPixels = (pixels, unit) => {
    switch (unit) {
      case 'cm':
        return (pixels * 2.54 / DPI).toFixed(2);
      case 'in':
        return (pixels / DPI).toFixed(2);
      case 'px':
      default:
        return pixels;
    }
  };

  const handleWidthChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCropWidth(value);
    const widthInPx = toPixels(value, unit);
    setCropArea(prev => ({ ...prev, width: widthInPx }));
  };

  const handleHeightChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCropHeight(value);
    const heightInPx = toPixels(value, unit);
    setCropArea(prev => ({ ...prev, height: heightInPx }));
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    // Convert current values to new unit
    const widthInPx = toPixels(cropWidth, unit);
    const heightInPx = toPixels(cropHeight, unit);
    setCropWidth(parseFloat(fromPixels(widthInPx, newUnit)));
    setCropHeight(parseFloat(fromPixels(heightInPx, newUnit)));
    setCropArea(prev => ({ 
      ...prev, 
      width: widthInPx,
      height: heightInPx
    }));
  };

  const handleQualityChange = (e) => {
    setQuality(parseInt(e.target.value));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCropX = cropArea.x;
    const startCropY = cropArea.y;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Apply scaling to match the displayed image
      const scaledX = startCropX + deltaX / scaleX;
      const scaledY = startCropY + deltaY / scaleY;
      
      // Limit to image boundaries
      const maxX = imageDimensions.width - cropArea.width;
      const maxY = imageDimensions.height - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, scaledX)),
        y: Math.max(0, Math.min(maxY, scaledY))
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (e, direction) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = cropArea.width;
    const startHeight = cropArea.height;
    const startXPos = cropArea.x;
    const startYPos = cropArea.y;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scaleX;
      const deltaY = (moveEvent.clientY - startY) / scaleY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startXPos;
      let newY = startYPos;
      
      const minSize = 50 / scaleX; // Minimum size in original image pixels
      
      if (direction.includes('e')) {
        newWidth = Math.max(minSize, startWidth + deltaX);
      }
      if (direction.includes('s')) {
        newHeight = Math.max(minSize, startHeight + deltaY);
      }
      if (direction.includes('w')) {
        newWidth = Math.max(minSize, startWidth - deltaX);
        newX = startXPos + (startWidth - newWidth);
      }
      if (direction.includes('n')) {
        newHeight = Math.max(minSize, startHeight - deltaY);
        newY = startYPos + (startHeight - newHeight);
      }
      
      // Limit to image boundaries
      newX = Math.max(0, Math.min(imageDimensions.width - newWidth, newX));
      newY = Math.max(0, Math.min(imageDimensions.height - newHeight, newY));
      newWidth = Math.min(newWidth, imageDimensions.width - newX);
      newHeight = Math.min(newHeight, imageDimensions.height - newY);
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY, width: newWidth, height: newHeight }));
      
      // Update input fields
      setCropWidth(parseFloat(fromPixels(newWidth, unit)));
      setCropHeight(parseFloat(fromPixels(newHeight, unit)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handlePreview = () => {
    if (!image) return;
    
    const img = new Image();
    img.src = image;
    
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
      
      // Apply compression quality
      const croppedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setPreviewImage(croppedDataUrl);
    };
  };

  const handleDownload = () => {
    // Always generate fresh preview with current quality
    if (!image) return;
    
    const img = new Image();
    img.src = image;
    
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
      
      // Apply compression quality
      const croppedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setPreviewImage(croppedDataUrl);
      
      // Download the compressed image
      const link = document.createElement('a');
      link.download = `cropped-image-${quality}%.jpg`;
      link.href = croppedDataUrl;
      link.click();
    };
  };

const handleCrop = () => {
    if (onCropComplete) {
      onCropComplete(cropArea);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setCompressedSize(0);
    setOriginalSize(0);
    if (onClearImage) {
      onClearImage();
    }
    if (onCropComplete) {
      onCropComplete(null);
    }
  };

  const handleSuccessPopupOk = () => {
    setShowSuccessPopup(false);
    handleCancel();
  };

  const handleDownloadClick = () => {
    handleDownload();
    setShowSuccessPopup(true);
  };

  // Calculate scaled crop area for display
  const displayCropArea = {
    x: cropArea.x * scaleX,
    y: cropArea.y * scaleY,
    width: cropArea.width * scaleX,
    height: cropArea.height * scaleY
  };

  return (
    <div className="crop-tool">
      <h2>Crop Image</h2>
      
      <div className="crop-inputs">
        <div className="input-group">
          <label htmlFor="crop-width">Width:</label>
          <input
            type="number"
            id="crop-width"
            value={cropWidth}
            onChange={handleWidthChange}
            min="1"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="crop-height">Height:</label>
          <input
            type="number"
            id="crop-height"
            value={cropHeight}
            onChange={handleHeightChange}
            min="1"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="crop-unit">Unit:</label>
          <select id="crop-unit" value={unit} onChange={handleUnitChange}>
            <option value="px">Pixels (px)</option>
            <option value="cm">Centimeters (cm)</option>
            <option value="in">Inches (in)</option>
          </select>
        </div>
        
        <div className="input-group quality-group">
          <label htmlFor="crop-quality">Quality: {quality}%</label>
          <input
            type="range"
            id="crop-quality"
            min="1"
            max="100"
            value={quality}
            onChange={handleQualityChange}
          />
        </div>
      </div>
      
      <div className="crop-container" ref={containerRef}>
        {image ? (
          <div className="image-wrapper">
            <img 
              ref={imageRef}
              src={image} 
              alt="To crop" 
              className="crop-image"
              onMouseDown={handleMouseDown}
            />
            <div 
              className="crop-area"
              style={{
                left: displayCropArea.x,
                top: displayCropArea.y,
                width: displayCropArea.width,
                height: displayCropArea.height
              }}
            >
              <div className="resize-handle nw" onMouseDown={(e) => handleResize(e, 'nw')}></div>
              <div className="resize-handle ne" onMouseDown={(e) => handleResize(e, 'ne')}></div>
              <div className="resize-handle sw" onMouseDown={(e) => handleResize(e, 'sw')}></div>
              <div className="resize-handle se" onMouseDown={(e) => handleResize(e, 'se')}></div>
              <div className="crop-size-label">
                {cropWidth} x {cropHeight} {unit}
              </div>
            </div>
          </div>
        ) : (
          <p>No image loaded. Please upload an image first.</p>
        )}
      </div>
      
<div className="crop-controls">
        {/* <button onClick={handleCrop} disabled={!image}>
          Apply Crop
        </button> */}
        <button onClick={handlePreview} disabled={!image}>
          Preview
        </button>
        <button onClick={handleDownloadClick} disabled={!image}>
          Download Compressed
        </button>
        <button onClick={handleCancel} disabled={!image} className="cancel-btn">
          Cancel
        </button>
      </div>
      
      {image && (
        <div className="size-info">
          <p>Original Size: {formatFileSize(originalSize)}</p>
          <p>Compressed Size: {formatFileSize(compressedSize)}</p>
        </div>
      )}
      
      {previewImage && (
        <div className="preview-section">
          <h3>Preview (Quality: {quality}%)</h3>
          <img src={previewImage} alt="Cropped preview" className="preview-image" />
        </div>
      )}
      
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Success!</h3>
            <p>Image compressed and downloaded successfully!</p>
            <p>Compressed Size: {formatFileSize(compressedSize)}</p>
            <button onClick={handleSuccessPopupOk} className="popup-ok-btn">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropTool;
