'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, ExternalLink, Copy } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import { EVENT_CONFIG, generateLinkedInCaption } from '@/lib/eventConfig';

// ─── Master Template Source: public/iam_iam_attending_card_updated.png (853 × 1280 px) ───
const CARD_W = 853;
const CARD_H = 1280;

// ─── Authoritative Visual Coordinates & Geometry ───────────────────────────
const PHOTO_REGION = { x: 477, y: 545, width: 266, height: 324, chamfer: 18 };
const FRAME_REGION = { x: 430, y: 500, width: 360, height: 410 };

const NAME_POS = { x: 108, baselineY: 636, maxW: 340, initialFs: 34 };
const ROLL_POS = { centerX: 285, centerY: 753, usableBoxW: 220, initialFs: 26 };
const BRANCH_POS = { x: 195, baselineY: 844, usableBoxW: 220, initialFs: 22 };

interface Participant {
  full_name: string;
  roll_number: string;
  section?: string;
  branch?: string;
  year: string;
}

interface Props {
  participant: Participant;
  onToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

// Module-level template image cache so network is never fetched repeatedly on state changes
let cachedTplImage: HTMLImageElement | null = null;

function loadMasterTemplate(): Promise<HTMLImageElement> {
  if (cachedTplImage && cachedTplImage.complete && cachedTplImage.naturalWidth > 0) {
    return Promise.resolve(cachedTplImage);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedTplImage = img;
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = `/iam_iam_attending_card_updated.png?v=instant_v5`;
    if (img.complete && img.naturalWidth > 0) {
      cachedTplImage = img;
      resolve(img);
    }
  });
}

// Load a data:/blob:/https: URL into an HTMLImageElement reliably.
// Uses createImageBitmap (zero CORS issues on local data:) then paints it via an offscreen canvas
// to get a drawable HTMLImageElement. Falls back to plain onload path.
async function loadPhotoElement(url: string): Promise<HTMLImageElement> {
  // PRIMARY: createImageBitmap — works for data: and blob: without any CORS restriction
  if (typeof createImageBitmap !== 'undefined') {
    try {
      let bitmapSource: ImageBitmapSource;
      if (url.startsWith('data:')) {
        // Convert data URL → Blob so createImageBitmap can accept it
        const res = await fetch(url);
        bitmapSource = await res.blob();
      } else {
        // For blob: or https: URLs pass directly
        const res = await fetch(url);
        bitmapSource = await res.blob();
      }
      const bitmap = await createImageBitmap(bitmapSource);
      // Paint the bitmap onto an offscreen canvas → export as data URL → load into img
      const oc = document.createElement('canvas');
      oc.width = bitmap.width;
      oc.height = bitmap.height;
      const oc2d = oc.getContext('2d')!;
      oc2d.drawImage(bitmap, 0, 0);
      bitmap.close();
      const dataUrl = oc.toDataURL('image/png');
      const img = new Image();
      await new Promise<void>((res2, rej2) => {
        img.onload = () => res2();
        img.onerror = rej2;
        img.src = dataUrl;
      });
      console.log('[loadPhotoElement] createImageBitmap path OK. naturalWidth=', img.naturalWidth);
      return img;
    } catch (bitmapErr) {
      console.warn('[loadPhotoElement] createImageBitmap path failed, trying onload:', bitmapErr);
    }
  }

  // FALLBACK: plain onload (works for all browser environments)
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      console.log('[loadPhotoElement] onload fallback OK. naturalWidth=', img.naturalWidth);
      resolve(img);
    };
    img.onerror = (e) => {
      console.error('[loadPhotoElement] onload fallback FAILED:', e);
      reject(e);
    };
    img.src = url;
  });
}

export default function CanonicalSocialCard({ participant, onToast }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  // Canonical flattened card PNG data-URL (853x1280). Single source for preview & download.
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const branch = participant.branch || 'CSE';

  // Inner Photo Window Path: Chamfered / Beveled angular cut corners matching frame geometry
  // startNew=true (default): opens a fresh path. Pass false to append to the current path.
  const addPhotoCutoutPath = (pathCtx: CanvasRenderingContext2D, startNew = true) => {
    const { x: px, y: py, width: pw, height: ph, chamfer: c } = PHOTO_REGION;
    if (startNew) pathCtx.beginPath();
    pathCtx.moveTo(px + c, py);
    pathCtx.lineTo(px + pw - c, py);
    pathCtx.lineTo(px + pw, py + c);
    pathCtx.lineTo(px + pw, py + ph - c);
    pathCtx.lineTo(px + pw - c, py + ph);
    pathCtx.lineTo(px + c, py + ph);
    pathCtx.lineTo(px, py + ph - c);
    pathCtx.lineTo(px, py + c);
    pathCtx.closePath();
  };

  // ─── 4-Layer + Calibration Overlay Rendering Engine ────────────────────────
  const generateCard = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Offscreen canvas at exact master resolution (853 x 1280 px)
      const canvas = document.createElement('canvas');
      canvas.width = CARD_W;
      canvas.height = CARD_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Check URL search params for developer calibration mode (?cardDebug=true or ?grid=true)
      const isDebugMode = typeof window !== 'undefined' && (
        window.location.search.includes('cardDebug=true') ||
        window.location.search.includes('grid=true')
      );

      // ── LAYER 1: Load & Prepare Clean Master Background Artwork ────────────
      const tpl = await loadMasterTemplate();

      // Draw master template onto offscreen background canvas
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = CARD_W;
      bgCanvas.height = CARD_H;
      const bgCtx = bgCanvas.getContext('2d');
      if (!bgCtx) return;
      bgCtx.drawImage(tpl, 0, 0, CARD_W, CARD_H);

      // === INPAINTING STRATEGY ===
      // patchArea tiled a small source region — but the source coords were inside the
      // patterned area itself, so it tiled the stripes instead of removing them.
      // Fix: sample a single clean background pixel from the left margin (no design elements there)
      // then fillRect only the interior zones we want to clear.

      // Sample background color from the left-margin (x=12, y=350) — clean background in all templates
      // Fallback to hard-coded dark navy if the sampled pixel is too bright (hit a design element)
      const bgPx = bgCtx.getImageData(12, 350, 1, 1).data;
      const luminance = 0.299 * bgPx[0] + 0.587 * bgPx[1] + 0.114 * bgPx[2];
      const cleanBg = luminance < 40
        ? `rgb(${bgPx[0]}, ${bgPx[1]}, ${bgPx[2]})`
        : '#050e20'; // fallback: known card dark-navy background

      // INPAINT 1 — Name area below PARTICIPANT heading (heading sits above y≈612)
      // Clears only the "YOUR NAME" placeholder stripe zone; PARTICIPANT label above is untouched
      bgCtx.fillStyle = cleanBg;
      bgCtx.fillRect(70, 614, 390, 58);

      // INPAINT 2 — Roll badge INTERIOR only
      // Outer border (outermost ~8px), angular ends, and person icon (x < 196) are preserved
      bgCtx.fillStyle = cleanBg;
      bgCtx.fillRect(196, 726, 214, 52);

      // INPAINT 3 — Branch placeholder area
      bgCtx.fillStyle = cleanBg;
      bgCtx.fillRect(185, 812, 228, 48);

      // Fill inner photo cutout on background layer
      bgCtx.fillStyle = '#040f20';
      addPhotoCutoutPath(bgCtx);
      bgCtx.fill();

      // Render Layer 1: Cleaned Master Background onto main canvas
      ctx.drawImage(bgCanvas, 0, 0);

      // ── LAYER 2: Participant Photograph (clipped behind frame) ─────────────
      ctx.save();
      addPhotoCutoutPath(ctx);
      ctx.clip();

      const { x: px, y: py, width: pw, height: ph } = PHOTO_REGION;

      console.log('[generateCard] photoUrl present?', !!photoUrl, photoUrl ? photoUrl.slice(0, 60) : 'null');
      if (photoUrl) {
        try {
          console.log('[generateCard] calling loadPhotoElement…');
          const photo = await loadPhotoElement(photoUrl);
          console.log('[generateCard] photo loaded. naturalWidth=', photo?.naturalWidth, 'naturalHeight=', photo?.naturalHeight);
          if (photo && photo.naturalWidth > 0) {
            const scale = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
            const sw = photo.naturalWidth * scale;
            const sh = photo.naturalHeight * scale;
            const sx = px + (pw - sw) / 2;
            const sy = py + (ph - sh) / 2;
            console.log('[generateCard] drawImage at', sx, sy, sw, sh);
            ctx.drawImage(photo, sx, sy, sw, sh);
            console.log('[generateCard] drawImage DONE ✓');
          } else {
            console.warn('[generateCard] photo loaded but naturalWidth=0, skipping draw');
          }
        } catch (photoErr) {
          console.error('[CanonicalSocialCard] Photo loading error:', photoErr);
        }
      } else {
        // Default sleek avatar placeholder graphic inside photo window
        const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
        grad.addColorStop(0, '#0a2540');
        grad.addColorStop(1, '#020b18');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, pw, ph);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph * 0.38, pw * 0.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph * 0.9, pw * 0.38, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // ── LAYER 3: Original Master Frame Artwork ON TOP of Photo ─────────────
      // Clip outer frame box MINUS inner photo cutout (evenodd rule).
      // IMPORTANT: addPhotoCutoutPath must use startNew=false here to extend the rect path,
      // NOT start a new one — otherwise the rect is erased and the clip becomes just the cutout.
      ctx.save();
      ctx.beginPath();
      ctx.rect(FRAME_REGION.x, FRAME_REGION.y, FRAME_REGION.width, FRAME_REGION.height);
      addPhotoCutoutPath(ctx, false); // ← append photo window path WITHOUT resetting the rect
      ctx.clip('evenodd'); // evenodd: inside rect but outside photo window = frame border only
      ctx.drawImage(
        tpl,
        FRAME_REGION.x, FRAME_REGION.y, FRAME_REGION.width, FRAME_REGION.height,
        FRAME_REGION.x, FRAME_REGION.y, FRAME_REGION.width, FRAME_REGION.height
      );
      ctx.restore();

      // ── LAYER 4: Dynamic Participant Text ──────────────────────────────────
      // 1. Participant Name — COMPLETE FULL NAME (never initials, never truncated)
      ctx.textBaseline = 'alphabetic';
      const rawName = participant.full_name || 'YOUR FULL NAME';
      const name = rawName.toUpperCase();
      let nameFs = NAME_POS.initialFs;
      ctx.font = `bold ${nameFs}px 'Inter', system-ui, -apple-system, sans-serif`;
      while (ctx.measureText(name).width > NAME_POS.maxW && nameFs > 18) {
        nameFs -= 1;
        ctx.font = `bold ${nameFs}px 'Inter', system-ui, -apple-system, sans-serif`;
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillText(name, NAME_POS.x, NAME_POS.baselineY);

      // 2. Roll Number — COMPLETE ROLL NUMBER, 25px bold monospace, centered in badge
      ctx.textBaseline = 'middle';
      const rawRoll = participant.roll_number || '26U61A0000';
      const roll = rawRoll.toUpperCase();
      let rollFs = ROLL_POS.initialFs;
      ctx.font = `bold ${rollFs}px 'Consolas', 'Courier New', monospace`;
      while (ctx.measureText(roll).width > ROLL_POS.usableBoxW && rollFs > 14) {
        rollFs -= 1;
        ctx.font = `bold ${rollFs}px 'Consolas', 'Courier New', monospace`;
      }
      ctx.fillStyle = '#00F0FF';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.45)';
      ctx.shadowBlur = 4;
      ctx.fillText(roll, ROLL_POS.centerX, ROLL_POS.centerY);

      // 3. Branch & Year — Left-aligned at X=195, baselineY=844
      ctx.textBaseline = 'alphabetic';
      const branchText = `${branch} \u2022 ${participant.year}`;
      let branchFs = BRANCH_POS.initialFs;
      ctx.font = `600 ${branchFs}px 'Inter', system-ui, -apple-system, sans-serif`;
      while (ctx.measureText(branchText).width > BRANCH_POS.usableBoxW && branchFs > 12) {
        branchFs -= 1;
        ctx.font = `600 ${branchFs}px 'Inter', system-ui, -apple-system, sans-serif`;
      }
      ctx.fillStyle = '#E2E8F0';
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(branchText, BRANCH_POS.x, BRANCH_POS.baselineY);

      ctx.shadowBlur = 0;

      // ── LAYER 5: Developer Calibration Overlay (?cardDebug=true) ───────────
      if (isDebugMode) {
        for (let x = 0; x < CARD_W; x += 10) {
          ctx.strokeStyle = (x % 50 === 0) ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = (x % 50 === 0) ? 1.5 : 0.5;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, CARD_H);
          ctx.stroke();

          if (x % 50 === 0 && x > 0) {
            ctx.font = '10px monospace';
            ctx.fillStyle = '#00F0FF';
            ctx.fillText(`${x}`, x + 2, 12);
          }
        }

        for (let y = 0; y < CARD_H; y += 10) {
          ctx.strokeStyle = (y % 50 === 0) ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = (y % 50 === 0) ? 1.5 : 0.5;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CARD_W, y);
          ctx.stroke();

          if (y % 50 === 0 && y > 0) {
            ctx.font = '10px monospace';
            ctx.fillStyle = '#00F0FF';
            ctx.fillText(`${y}`, 2, y - 4);
          }
        }

        // Bounding boxes for calibration
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        addPhotoCutoutPath(ctx);
        ctx.stroke();

        ctx.strokeStyle = '#FF0055';
        ctx.strokeRect(175, 725, 220, 56);
        ctx.beginPath();
        ctx.arc(285, 753, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FF0055';
        ctx.fill();

        ctx.strokeStyle = '#00FF66';
        ctx.strokeRect(195, 820, 220, 35);

        ctx.strokeStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(108, 636);
        ctx.lineTo(448, 636);
        ctx.stroke();
      }

      // Flatten composition to single PNG data-URL (853 x 1280 px)
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setCardDataUrl(dataUrl);

    } catch (err) {
      console.error('[CanonicalSocialCard] generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [participant, photoUrl, branch]);

  useEffect(() => {
    generateCard();
  }, [generateCard]);

  const handlePhotoSelect = (newUrl: string | null) => {
    setPhotoUrl(newUrl);
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────

  // Canonical caption — SINGLE source of truth for both buttons.
  // Uses branch + year for personalization. Never includes private fields.
  const getCaption = () => generateLinkedInCaption({
    full_name: participant.full_name,
    branch: participant.branch,
    year: participant.year,
  });

  // Sanitize name for filesystem: keep letters/digits, replace everything else with hyphens
  const safeFilename = () => {
    const safe = (participant.full_name || 'Participant')
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return `Code-Meets-AI-I-Am-Attending-${safe}.png`;
  };

  const download = () => {
    if (!cardDataUrl) return;
    const a = document.createElement('a');
    a.href = cardDataUrl;
    a.download = safeFilename();
    a.click();
    if (onToast) onToast('success', 'Card downloaded! 🚀');
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(getCaption());
      if (onToast) onToast('success', '✓ Caption copied! Paste it into your LinkedIn post.');
    } catch {
      if (onToast) onToast('info', 'Could not copy automatically — use COPY CAPTION button.');
    }
  };

  /**
   * POST ON LINKEDIN flow:
   *  1. Open LinkedIn window SYNCHRONOUSLY (must be before any await to survive popup blockers).
   *  2. Download the card PNG.
   *  3. Copy the caption to clipboard.
   *  4. Show a clear toast explaining the manual attachment step.
   *
   * The card is NEVER automatically uploaded to LinkedIn. No API. No OAuth.
   */
  const postOnLinkedIn = async () => {
    if (!cardDataUrl || isPosting) return;
    setIsPosting(true);

    // STEP 1: Open LinkedIn NOW — must be synchronous (before any await) to avoid popup blockers
    const linkedInWindow = window.open(
      'https://www.linkedin.com/feed/?shareActive=true',
      '_blank',
      'noopener,noreferrer'
    );

    try {
      // STEP 2: Download the card
      const a = document.createElement('a');
      a.href = cardDataUrl;
      a.download = safeFilename();
      a.click();

      // STEP 3: Copy caption to clipboard
      let captionCopied = false;
      try {
        await navigator.clipboard.writeText(getCaption());
        captionCopied = true;
      } catch {
        // Clipboard failed — not fatal, inform user
      }

      // STEP 4: Toast with clear explanation
      if (captionCopied) {
        if (onToast) onToast(
          'success',
          '✓ CARD READY — Your event card has been downloaded and your LinkedIn caption has been copied. Attach the image to your post and publish when you\'re ready.'
        );
      } else {
        if (onToast) onToast(
          'warning',
          'Card downloaded. Caption could not be copied automatically — use the COPY CAPTION button.'
        );
      }

      // If the browser blocked the popup, inform the user
      if (!linkedInWindow || linkedInWindow.closed) {
        if (onToast) onToast(
          'info',
          'Your card is downloaded and caption copied. Open LinkedIn manually to create your post.'
        );
      }
    } catch (err) {
      console.error('[postOnLinkedIn] error:', err);
      if (onToast) onToast('error', 'Unable to prepare your card. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // ─── UI Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full font-mono space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">
            📣 YOUR "I'M ATTENDING" CARD
          </p>
          <p className="text-sm font-black text-white uppercase tracking-wide mt-0.5">
            Download &amp; Share on LinkedIn
          </p>
        </div>
        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-3 py-1 rounded-full font-bold">
          853×1280
        </span>
      </div>

      {/* Photo uploader */}
      <PhotoUploader
        photoUrl={photoUrl}
        onPhotoSelected={handlePhotoSelect}
        onError={(msg) => onToast?.('error', msg)}
      />

      {/* ── CARD PREVIEW ────────────────────────────────────────────────────────
          Single canonical <img> showing cardDataUrl (853 x 1280 px).
          Preview = Downloaded PNG = Shared PNG.
      */}
      <div className="w-full flex justify-center">
        {isGenerating || !cardDataUrl ? (
          <div className="flex flex-col items-center gap-3 py-16 text-cyan-500">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Rendering card composition…</span>
          </div>
        ) : (
          <img
            src={cardDataUrl}
            alt="I'M ATTENDING personalized card"
            className="w-full max-w-[380px] rounded-xl shadow-2xl block"
            style={{ aspectRatio: '853 / 1280' }}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          id="btn-post-linkedin"
          onClick={postOnLinkedIn}
          disabled={isGenerating || !cardDataUrl || isPosting}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-black text-sm rounded-2xl uppercase tracking-wider shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              PREPARING…
            </>
          ) : (
            <>
              <ExternalLink className="w-5 h-5 stroke-[2.5]" />
              POST ON LINKEDIN ↗
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            id="btn-download-card"
            onClick={download}
            disabled={isGenerating || !cardDataUrl}
            className="py-3.5 bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-300 font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            DOWNLOAD CARD
          </button>

          <button
            id="btn-copy-caption"
            onClick={copyCaption}
            disabled={!cardDataUrl}
            className="py-3.5 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-4 h-4 text-cyan-400" />
            COPY CAPTION
          </button>
        </div>
      </div>
    </div>
  );
}
