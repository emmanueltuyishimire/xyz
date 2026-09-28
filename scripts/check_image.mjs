try {
  const sharp = (await import('sharp')).default;
  console.log('sharp is available!');
  const meta = await sharp('public/emmanuel.png').metadata();
  console.log('Image dimensions:', meta.width, 'x', meta.height, 'format:', meta.format);
  
  // Create optimized webp and smaller png for web use
  await sharp('public/emmanuel.png')
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile('public/emmanuel.webp');
  console.log('Created public/emmanuel.webp');

  await sharp('public/emmanuel.png')
    .resize(400, 400, { fit: 'cover' })
    .png({ quality: 85, compressionLevel: 8 })
    .toFile('public/emmanuel-opt.png');
  console.log('Created public/emmanuel-opt.png');

} catch (e) {
  console.log('sharp error:', e);
}
