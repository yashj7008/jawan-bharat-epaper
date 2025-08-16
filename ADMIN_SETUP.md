# Admin Dashboard Setup Guide

## Overview
This admin dashboard allows you to upload multiple images to Cloudinary for use in your newspaper application.

## Features
- ✅ Multiple image upload support
- ✅ Drag & drop file selection
- ✅ Real-time upload progress
- ✅ Cloudinary integration
- ✅ Image preview and management
- ✅ Error handling and status tracking

## Setup Instructions

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Note your **Cloud Name** from the dashboard

### 2. Create Upload Preset
1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set **Signing Mode** to **"Unsigned"**
5. Give it a name (e.g., "newspaper_uploads")
6. Save the preset

### 3. Configure Environment Variables
1. Create a `.env` file in your project root
2. Add these variables:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Example:**
```env
VITE_CLOUDINARY_CLOUD_NAME=mynewspaper
VITE_CLOUDINARY_UPLOAD_PRESET=newspaper_uploads
```

### 4. Restart Development Server
```bash
npm run dev
```

### 5. Access Admin Dashboard
Navigate to `/admin` in your application or click the "Admin" button in the header.

## Usage

### Uploading Images
1. Click **"Choose Files"** or drag images to the upload area
2. Select multiple images (JPG, PNG, GIF, WebP supported)
3. Click **"Upload All"** to start the upload process
4. Monitor progress and status for each image

### Managing Images
- **Remove**: Click the X button on any image card
- **Status**: Each image shows its upload status (pending, uploading, success, error)
- **Progress**: Real-time progress bar during upload
- **URLs**: Successfully uploaded images show their Cloudinary URL

## File Structure
```
src/
├── components/
│   └── AdminDashboard.tsx    # Main admin dashboard component
├── lib/
│   └── cloudinary.ts         # Cloudinary configuration and API
└── pages/
    └── Admin.tsx             # Admin page route
```

## Security Notes
- Upload presets are set to "Unsigned" for client-side uploads
- No API keys are exposed in the frontend
- Cloudinary handles file validation and security

## Troubleshooting

### Common Issues
1. **"Upload failed" error**: Check your Cloudinary credentials and upload preset
2. **Images not showing**: Ensure your upload preset is set to "Unsigned"
3. **Environment variables not working**: Restart your development server after creating `.env`

### Support
- Check Cloudinary documentation: [docs.cloudinary.com](https://docs.cloudinary.com)
- Verify your upload preset settings
- Ensure environment variables are correctly set

## Next Steps
After setting up, you can:
- Integrate uploaded images into your newspaper pages
- Create image management features
- Add image optimization and transformation options
- Implement user authentication for admin access
