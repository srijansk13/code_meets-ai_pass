'use client';

import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PosterModal({ isOpen, onClose }: PosterModalProps) {
  const [zoomed, setZoomed] = useState(false);
  const [imgSrc, setImgSrc] = useState('/poster.jpg');

  if (!isOpen) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = 'CODE_MEETS_AI_POSTER.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 transition-all duration-300 animate-fade-in select-none"
    >
      {/* Modal Top Control Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md flex items-center justify-between z-10 pt-2 pb-2"
      >
        <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
          <span>📄 EVENT POSTER</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomed(!zoomed)}
            className="p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
            title={zoomed ? 'Zoom Out' : 'Zoom In'}
          >
            {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono rounded-full flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-full hover:bg-red-900 hover:text-red-300 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lightbox Image Box */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setZoomed(!zoomed);
        }}
        className={`w-full max-w-md flex-1 flex items-center justify-center overflow-auto my-2 cursor-pointer transition-transform duration-300 ${
          zoomed ? 'scale-125' : 'scale-100'
        }`}
      >
        <img
          src={imgSrc}
          alt="CODE MEETS AI Event Poster"
          className="max-h-[75vh] w-auto object-contain rounded-xl border border-slate-800 shadow-2xl"
          onError={() => {
            if (imgSrc === '/poster.jpg') setImgSrc('/Poster.png');
            else if (imgSrc === '/Poster.png') setImgSrc('/poster.png');
            else if (imgSrc === '/poster.png') setImgSrc('/logo.jpeg');
          }}
        />
      </div>

      {/* Bottom Hint Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800"
      >
        Tap image to {zoomed ? 'zoom out' : 'zoom in'} • Tap ✕ to return
      </div>
    </div>
  );
}
