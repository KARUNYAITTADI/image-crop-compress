# image-crop-compress

A web application for cropping and compressing images with flexible sizing options.

## Features

- Image upload (JPEG, PNG, WebP)
- Crop selection tool with preview
- Image compression with adjustable quality
- Display file size (dynamic: KB, MB)
- Show and edit dimensions (in cm, inch, or px)
- Dropdown for size/dimension units
- Download processed image

## Project Structure

```
image-crop-compress/
├── src/
│   ├── components/
│   │   ├── CropTool.jsx      # Image cropping component
│   │   ├── CompressTool.jsx  # Image compression component
│   │   └── UnitSelector.jsx  # Unit selection dropdown (px, cm, in)
│   ├── utils/
│   │   └── imageUtils.js     # Image utility functions
│   ├── styles/
│   │   └── App.css           # Main application styles
│   ├── App.jsx               # Main application component
│   └── index.js              # Application entry point
├── README.md
└── TODO.md
```

## Getting Started

1. Install dependencies:
   
```
   npm install
   
```

2. Start the development server:
   
```
   npm start
   
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click "Upload Image" to select an image file (JPEG, PNG, or WebP)
2. Use the Crop tool to select the area you want to keep
3. Use the Compress tool to adjust the image quality
4. Select your preferred unit (px, cm, or in) to view dimensions
5. Click "Download Image" to save the processed image

## Technologies Used

- React
- HTML5 Canvas API
- CSS3

## License

MIT
