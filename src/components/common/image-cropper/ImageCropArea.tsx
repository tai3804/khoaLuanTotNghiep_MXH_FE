import React from 'react';

interface ImageCropAreaProps {
  imageSrc: string | null;
  mode: 'avatar' | 'cover';
  zoom: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  offset: { x: number; y: number };
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  cropAreaRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onWheel: (e: React.WheelEvent) => void;
}

export const ImageCropArea: React.FC<ImageCropAreaProps> = ({
  imageSrc,
  mode,
  zoom,
  rotation,
  flipH,
  flipV,
  offset,
  isDragging,
  containerRef,
  cropAreaRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onWheel,
}) => {
  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      className={`relative w-full h-[360px] sm:h-[420px] bg-[#0c0d0e] overflow-hidden flex items-center justify-center select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Background Transformed Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Cropping target"
          draggable={false}
          className="max-w-none pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0px) scale(${zoom}) rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
            transformOrigin: 'center center',
            maxHeight: mode === 'avatar' ? '300px' : '260px',
            maxWidth: '100%',
          }}
        />
      )}

      {/* Visual Crop Overlay (Aperture Mask) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {mode === 'avatar' ? (
          <div
            ref={cropAreaRef}
            className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] relative overflow-hidden"
          >
            {/* Rule of Thirds Grid Guidelines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          </div>
        ) : (
          <div
            ref={cropAreaRef}
            className="w-[90%] max-w-[540px] aspect-[16/9] sm:aspect-[2.5/1] rounded-xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] relative overflow-hidden"
          >
            {/* Rule of Thirds Grid Guidelines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          </div>
        )}
      </div>

      {/* Floating Hint */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white/80 text-[11px] px-3 py-1 rounded-full pointer-events-none border border-white/10">
        Kéo để di chuyển • Lăn chuột để phóng to
      </div>
    </div>
  );
};
