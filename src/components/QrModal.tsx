import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, ExternalLink, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Settings } from '../types';
import { Logo } from './Logo';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, settings }) => {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Dynamic current origin URL
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://empathy1.netlify.app';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = currentUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings.name} ${settings.subtitle} — Digital Menu`,
          text: `${settings.tagline} (${settings.hours}) — ${settings.location}`,
          url: currentUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await handleCopy();
      setShareFeedback('Link copied to clipboard');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#F9F8F4';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(image, 50, 50, 500, 500);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `empathy-coffee-qr-${Date.now()}.png`;
        link.href = pngUrl;
        link.click();
      }
      URL.revokeObjectURL(svgUrl);
    };
    image.src = svgUrl;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Digital Menu QR Code"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0E3524]/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-[#0E3524] text-[#EBE4D1] p-6 sm:p-8 shadow-2xl border border-[#EBE4D1]/20 flex flex-col items-center text-center"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close QR Modal"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#EBE4D1]/10 hover:bg-[#C4283D] text-[#EBE4D1] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo and Subheading */}
            <Logo variant="compact" theme="dark" className="mb-4" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#E6BD83] font-medium mb-6">
              Scan for Digital Table Menu
            </p>

            {/* QR Card Frame */}
            <div
              ref={qrRef}
              className="relative p-5 bg-[#F9F8F4] rounded-3xl shadow-xl border-4 border-[#E6BD83]/40 flex flex-col items-center"
            >
              <QRCodeSVG
                value={currentUrl}
                size={200}
                bgColor="#F9F8F4"
                fgColor="#0E3524"
                level="H"
                includeMargin={false}
              />
              <div className="mt-3 pt-2.5 border-t border-[#0E3524]/10 w-full flex items-center justify-between text-[11px] font-mono-tabular text-[#0E3524]/80">
                <span>EMPATHY COFFEE</span>
                <span>{settings.hours}</span>
              </div>
            </div>

            {/* URL Pill */}
            <div className="mt-5 w-full max-w-sm">
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#EBE4D1]/10 border border-[#EBE4D1]/15 text-xs text-[#EBE4D1]/90">
                <ExternalLink className="w-3.5 h-3.5 text-[#E6BD83] shrink-0" />
                <span className="truncate font-mono-tabular text-[11px]" title={currentUrl}>
                  {currentUrl}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#C4283D] hover:bg-[#a82032] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied Link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Menu Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#EBE4D1]/15 hover:bg-[#EBE4D1]/25 text-[#EBE4D1] border border-[#EBE4D1]/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#EBE4D1]/15 hover:bg-[#EBE4D1]/25 text-[#EBE4D1] border border-[#EBE4D1]/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="Download QR Code image"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {shareFeedback && (
              <p className="mt-2 text-xs text-[#E6BD83]">{shareFeedback}</p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
