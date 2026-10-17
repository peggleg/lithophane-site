export function photoLayout(imageWidth, imageHeight, ratio, { crop = 'cover', panx = 50, pany = 50, zoom = 100 } = {}) {
  const imageRatio = imageWidth / imageHeight;
  let sx = 0, sy = 0, sw = imageWidth, sh = imageHeight, dx = 0, dy = 0, dw = 1, dh = 1;
  if (crop === 'cover') {
    if (imageRatio > ratio) sw = imageHeight * ratio;
    else sh = imageWidth / ratio;
    // Fill mode never exposes blank edges. Whole-photo fit is the explicit
    // alternative when preserving the complete composition matters more.
    const scale = Math.max(1, Math.min(4, zoom / 100));
    sw /= scale; sh /= scale;
    sx = (imageWidth - sw) * Math.max(0, Math.min(100, panx)) / 100;
    sy = (imageHeight - sh) * Math.max(0, Math.min(100, pany)) / 100;
  } else {
    dw = imageRatio > ratio ? 1 : imageRatio / ratio;
    dh = imageRatio > ratio ? ratio / imageRatio : 1;
    dx = (1 - dw) / 2; dy = (1 - dh) / 2;
  }
  return { sx, sy, sw, sh, dx, dy, dw, dh };
}

export function drawPhoto(context, image, width, height, ratio, adjustments) {
  const layout = photoLayout(image.width, image.height, ratio, adjustments);
  context.fillStyle = 'white'; context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
  const { sx, sy, sw, sh, dx, dy, dw, dh } = layout;
  context.drawImage(image, sx, sy, sw, sh, dx * width, dy * height, dw * width, dh * height);
  return layout;
}

export function adjustedTone(r, g, b, { brightness = 0, contrast = 0, invert = false } = {}) {
  const gain = (100 + contrast) / (100 - contrast);
  let tone = Math.max(0, Math.min(255, (r * 0.2126 + g * 0.7152 + b * 0.0722 - 127.5) * gain + 127.5 + brightness * 2.55));
  return invert ? 255 - tone : tone;
}

export function imageTones(rgba, adjustments) {
  const tones = new Float32Array(rgba.length / 4);
  for (let i = 0; i < tones.length; i++) {
    const j = i * 4;
    tones[i] = adjustedTone(rgba[j], rgba[j + 1], rgba[j + 2], adjustments);
  }
  return tones;
}

export function paintBacklight(pixels, adjustments, min, max) {
  let dark = 0, sum = 0;
  const rgba = pixels.data;
  for (let i = 0; i < rgba.length; i += 4) {
    const tone = adjustedTone(rgba[i], rgba[i + 1], rgba[i + 2], adjustments);
    sum += min + (1 - tone / 255) * (max - min); if (tone < 40) dark++;
    // Illustrative transmission, not a calibrated filament/light prediction.
    const light = 0.18 + 0.82 * (tone / 255) ** 0.7;
    rgba[i] = 255 * light; rgba[i + 1] = 225 * light; rgba[i + 2] = 174 * light; rgba[i + 3] = 255;
  }
  return { darkFraction: dark / (rgba.length / 4), meanThickness: sum / (rgba.length / 4) };
}

// Pointer movement follows the image, rather than the crop window. Clamp at the
// source edges so drag, sliders, preview and worker always describe one crop.
export function dragCrop(start, deltaX, deltaY) {
  const axis=(position,delta,displaySize,sourceSize,cropSize)=>{
    const travel=displaySize*(sourceSize/cropSize-1);
    return travel>1e-6?Math.max(0,Math.min(100,position-delta/travel*100)):position;
  };
  return {panx:axis(start.panx,deltaX,start.width,start.imageWidth,start.sw),pany:axis(start.pany,deltaY,start.height,start.imageHeight,start.sh)};
}
