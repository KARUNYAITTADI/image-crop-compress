# TODO - CropTool Enhancement

## Task: Add size display, cancel button, and success popup to CropTool

### Files to Edit:
- [ ] src/components/CropTool.jsx
- [ ] src/components/CropTool.css

### Changes Required:

1. **CropTool.jsx**:
   - [ ] Add state for `compressedSize` 
   - [ ] Add state for `showSuccessPopup`
   - [ ] Add `formatFileSize` helper function
   - [ ] Modify `compressImage` to calculate and display sizes
   - [ ] Add size display section below the image showing original and compressed size
   - [ ] Add cancel button next to download button
   - [ ] Add success popup with OK button that clears the image

2. **CropTool.css**:
   - [ ] Add styles for size display section
   - [ ] Add styles for success popup
   - [ ] Add styles for cancel button
