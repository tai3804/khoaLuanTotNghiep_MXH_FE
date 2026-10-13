import { useState, useRef, useCallback, useEffect } from 'react';
import { getCroppedImg, CropDimensions } from './cropUtils';

export interface UseImageCropperProps {
  imageFile?: File | null;
  imageSrc?: string | null;
  mode?: 'avatar' | 'cover';
  onCropComplete: (croppedFile: File) => Promise<void> | void;
  onClose: () => void;
}

export const useImageCropper = ({
  imageFile,
  imageSrc: propImageSrc,
  mode = 'avatar',
  onCropComplete,
  onClose,
}: UseImageCropperProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cropAreaRef = useRef<HTMLDivElement | null>(null);

  // Convert File to Object URL or use provided URL
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageSrc(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (propImageSrc) {
      setImageSrc(propImageSrc);
    }
  }, [imageFile, propImageSrc]);

  // Reset transforms whenever source changes
  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleFlipHorizontal = useCallback(() => {
    setFlipH((prev) => !prev);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.min(3, Math.max(1, newZoom)));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(3, Math.round((prev + 0.1) * 100) / 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(1, Math.round((prev - 0.1) * 100) / 100));
  }, []);

  // Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    },
    [offset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - offset.x,
          y: e.touches[0].clientY - offset.y,
        });
      }
    },
    [offset]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse wheel to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom((prev) => Math.min(3, Math.max(1, prev + delta)));
  }, []);

  // Save cropped result
  const handleSave = async () => {
    if (!imageSrc || !cropAreaRef.current || !containerRef.current) return;

    try {
      setIsProcessing(true);
      const cropRect = cropAreaRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const dimensions: CropDimensions = {
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        cropWidth: cropRect.width,
        cropHeight: cropRect.height,
      };

      const originalName = imageFile?.name || (mode === 'avatar' ? 'avatar.jpg' : 'cover.jpg');
      const croppedFile = await getCroppedImg(
        imageSrc,
        {
          zoom,
          rotation,
          flipH,
          flipV,
          offsetX: offset.x,
          offsetY: offset.y,
        },
        dimensions,
        originalName,
        imageFile?.type || 'image/jpeg'
      );

      await onCropComplete(croppedFile);
      onClose();
    } catch (error) {
      console.error('Failed to crop image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    imageSrc,
    zoom,
    rotation,
    flipH,
    flipV,
    offset,
    isDragging,
    isProcessing,
    containerRef,
    cropAreaRef,
    handleReset,
    handleRotate,
    handleFlipHorizontal,
    handleZoomChange,
    handleZoomIn,
    handleZoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    handleSave,
  };
};
