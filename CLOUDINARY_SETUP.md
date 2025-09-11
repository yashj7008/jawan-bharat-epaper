# Cloudinary Configuration for Cropped Images

This application now uses Cloudinary to store cropped newspaper images instead of localStorage. This allows shared cropped images to work properly across different devices and browsers.

## Environment Variables Required

Create a `.env` file in your project root with the following variables:

```env
# Cloudinary Configuration for Cropped Images
# Get these values from your Cloudinary Dashboard (https://cloudinary.com/console)

# Your Cloudinary Cloud Name
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here

# Upload preset for unsigned uploads (create this in your Cloudinary console)
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here

# API Key (found in your Cloudinary console)
VITE_CLOUDINARY_API_KEY=your_api_key_here

# API Secret (found in your Cloudinary console - keep this secure!)
VITE_CLOUDINARY_API_SECRET=your_api_secret_here
```

## Setup Instructions

### 1. Create Cloudinary Account
- Go to [Cloudinary](https://cloudinary.com) and create a free account
- Note down your Cloud Name from the dashboard

### 2. Create Upload Preset
- Go to Settings > Upload in your Cloudinary console
- Scroll down to "Upload presets"
- Click "Add upload preset"
- Set the following:
  - **Preset name**: Choose a name (e.g., `cropped_images`)
  - **Signing mode**: Select "Unsigned"
  - **Folder**: Set to `cropped-images` (optional but recommended)
  - **Access mode**: Set to "Public read"
- Save the preset and copy the preset name

### 3. Get API Credentials
- In your Cloudinary dashboard, find:
  - **Cloud Name**: Displayed at the top
  - **API Key**: Found in the "Account Details" section
  - **API Secret**: Found in the "Account Details" section (click to reveal)

### 4. Configure Environment
- Create a `.env` file in your project root
- Add all the variables with your actual Cloudinary credentials
- Restart your development server

## How It Works

### Image Upload Flow
1. User crops an image from a newspaper page
2. The cropped image is automatically uploaded to Cloudinary
3. A shareable URL is generated that works across all devices
4. The image is also stored in localStorage as a fallback

### Sharing Flow
1. When sharing a cropped image, the Cloudinary URL is used
2. Anyone with the link can view the image, even without localStorage data
3. Images are tagged for easy management and cleanup

### Fallback Mechanism
- If Cloudinary is not configured, the app falls back to localStorage
- If Cloudinary upload fails, the app still works with localStorage
- This ensures the app continues to function even with configuration issues

## File Structure

- `src/lib/cloudinaryCroppedService.ts` - Handles Cloudinary operations for cropped images
- `src/lib/croppedImageService.ts` - Main service that uses Cloudinary with localStorage fallback
- `src/components/ShareCroppedImage.tsx` - Updated to work with async uploads
- `src/pages/CroppedImage.tsx` - Updated to fetch from both Cloudinary and localStorage

## Troubleshooting

### Images Not Uploading
- Check that all environment variables are set correctly
- Verify the upload preset exists and is set to "Unsigned"
- Check browser console for error messages

### Shared Links Not Working
- Ensure the Cloudinary upload was successful
- Check that the image has public read access
- Verify the generated URL is accessible

### Performance Issues
- Cloudinary uploads happen in the background
- Users can still share images even if upload is in progress
- The app uses localStorage as immediate fallback

## Migration from localStorage

The app automatically handles the migration:
- Existing localStorage images continue to work
- New cropped images are uploaded to Cloudinary
- Shared links for new images work across devices
- Old shared links still work for users who have the localStorage data
