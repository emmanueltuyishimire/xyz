import sharp from 'sharp';
import fs from 'fs';

// Backup original raw if not backed up
if (!fs.existsSync('public/emmanuel-original-raw.png')) {
  fs.copyFileSync('public/emmanuel.png', 'public/emmanuel-original-raw.png');
}

// Create 800x800 high-res PNG for Retina/HiDPI screens
await sharp('public/emmanuel-original-raw.png')
  .resize(800, 800, { fit: 'cover' })
  .png({ quality: 90, compressionLevel: 9 })
  .toFile('public/emmanuel.png');

// Create 800x800 high-res WebP
await sharp('public/emmanuel-original-raw.png')
  .resize(800, 800, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile('public/emmanuel.webp');

console.log('Optimized emmanuel.png size:', fs.statSync('public/emmanuel.png').size);
console.log('Optimized emmanuel.webp size:', fs.statSync('public/emmanuel.webp').size);
