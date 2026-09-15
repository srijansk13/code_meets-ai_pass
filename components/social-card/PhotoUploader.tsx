'use client';

import React, { useRef } from 'react';
import { Upload, User, Trash2 } from 'lucide-react';

interface PhotoUploaderProps {
  photoUrl: string | null;
  onPhotoSelected: (url: string | null) => void;
  onError: (msg: string) => void;
}

export default function PhotoUploader({ photoUrl, onPhotoSelected, onError }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('Image file size must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onPhotoSelected(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#091228]/90 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-emerald-500/60 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
          {photoUrl ? (
            <img src={photoUrl} alt="Participant Portrait" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-slate-400" />
          )}
        </div>

        <div className="text-xs">
          <div className="font-extrabold text-white">YOUR SOCIAL CARD PORTRAIT</div>
          <div className="text-[10px] text-slate-400">
            {photoUrl ? '✓ Photo loaded (Stored locally in memory)' : 'JPG, PNG, WEBP up to 10MB'}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/60 text-cyan-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>{photoUrl ? 'CHANGE PHOTO 📸' : '+ ADD PHOTO 📸'}</span>
        </button>

        {photoUrl && (
          <button
            type="button"
            onClick={() => onPhotoSelected(null)}
            className="p-2.5 bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 rounded-xl transition-all"
            title="Remove Photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
