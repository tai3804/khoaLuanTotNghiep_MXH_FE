import React, { useEffect } from 'react';
import { useImageCropper, UseImageCropperProps } from './useImageCropper';
import { ImageCropHeader } from './ImageCropHeader';
import { ImageCropArea } from './ImageCropArea';
import { ImageCropControls } from './ImageCropControls';
import { ImageCropFooter } from './ImageCropFooter';

export interface ImageCropperModalProps extends UseImageCropperProps {
  isOpen: boolean;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageFile,
  imageSrc: propImageSrc,
  mode = 'avatar',
  onCropComplete,
  onClose,
}) => {
  const {
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
  } = useImageCropper({
    imageFile,
    imageSrc: propImageSrc,
    mode,
    onCropComplete,
    onClose,
  });

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <ImageCropHeader mode={mode} onClose={onClose} />

        {/* Interactive Viewport */}
        <ImageCropArea
          imageSrc={imageSrc}
          mode={mode}
          zoom={zoom}
          rotation={rotation}
          flipH={flipH}
          flipV={flipV}
          offset={offset}
          isDragging={isDragging}
          containerRef={containerRef}
          cropAreaRef={cropAreaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        />

        {/* Controls Toolbar */}
        <ImageCropControls
          zoom={zoom}
          rotation={rotation}
          onZoomChange={handleZoomChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotate={handleRotate}
          onFlipHorizontal={handleFlipHorizontal}
          onReset={handleReset}
        />

        {/* Footer */}
        <ImageCropFooter
          mode={mode}
          isProcessing={isProcessing}
          onClose={onClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};
