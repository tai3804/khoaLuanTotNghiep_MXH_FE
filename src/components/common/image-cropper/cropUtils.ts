export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export interface CropState {
  zoom: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  offsetX: number;
  offsetY: number;
}

export interface CropDimensions {
  containerWidth: number;
  containerHeight: number;
  cropWidth: number;
  cropHeight: number;
}

/**
 * Generates a cropped and transformed image File from HTML Canvas
 */
export const getCroppedImg = async (
  imageSrc: string,
  cropState: CropState,
  dimensions: CropDimensions,
  fileName: string = 'cropped-image.jpg',
  mimeType: string = 'image/jpeg'
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context available');
  }

  const { cropWidth, cropHeight, containerWidth, containerHeight } = dimensions;
  const { zoom, rotation, flipH, flipV, offsetX, offsetY } = cropState;

  // High resolution output for crystal clear image quality
  const targetWidth = Math.max(cropWidth * 2, 800);
  const targetHeight = Math.round((targetWidth * cropHeight) / cropWidth);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill background with solid black or white
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.save();

  // Move origin to canvas center
  ctx.translate(targetWidth / 2, targetHeight / 2);

  // Apply transformations
  const scaleRatio = targetWidth / cropWidth;
  ctx.scale(scaleRatio, scaleRatio);

  // Apply user offset
  ctx.translate(offsetX, offsetY);

  // Apply rotation
  ctx.rotate((rotation * Math.PI) / 180);

  // Apply flip
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // Compute image display dimensions in container space
  const imgAspect = image.width / image.height;
  const cropAspect = cropWidth / cropHeight;

  let baseWidth = cropWidth;
  let baseHeight = cropHeight;

  if (imgAspect > cropAspect) {
    baseHeight = cropHeight;
    baseWidth = cropHeight * imgAspect;
  } else {
    baseWidth = cropWidth;
    baseHeight = cropWidth / imgAspect;
  }

  const drawWidth = baseWidth * zoom;
  const drawHeight = baseHeight * zoom;

  // Draw image centered at the origin
  ctx.drawImage(
    image,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: mimeType });
        resolve(file);
      },
      mimeType,
      0.92
    );
  });
};
