import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2, Copy, Check, X } from 'lucide-react';

const QRCodeGenerator = ({ link, onClose }) => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (link) {
      generateQRCode();
    }
  }, [link]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/affiliate-links/${link._id}/qr-code`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrCode(data.q); // ✅ FIXED: use `q` instead of `qrCode`
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `qr-code-${link.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this course: ${link.courseId?.title || 'Course'}`,
          text: `Join this amazing course and start learning today!`,
          url: link.url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy link
      copyLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4">QR Code Generator</h2>
        
        {/* Link Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Course</p>
          <p className="font-medium">{link.courseId?.title || 'Course'}</p>
          <p className="text-sm text-gray-600 mt-2 mb-1">Affiliate Code</p>
          <p className="font-mono text-sm">{link.code}</p>
        </div>

        {/* QR Code Display */}
        <div className="text-center mb-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <div className="h-64 flex items-center justify-center">
              <div className="text-red-500 text-center">
                <p className="mb-2">Failed to generate QR code</p>
                <button
                  onClick={generateQRCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {qrCode && !loading && (
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
          )}
        </div>

        {/* Link Display */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Affiliate Link</p>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
            <input
              type="text"
              value={link.url}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
            />
            <button
              onClick={copyLink}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Copy link"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={downloadQRCode}
            disabled={!qrCode}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Download QR Code
          </button>
          
          <button
            onClick={shareLink}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Share2 size={16} />
            Share Link
          </button>
        </div>

        {/* Stats Preview */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{link.clicks || 0}</p>
              <p className="text-xs text-gray-600">Clicks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{link.conversions || 0}</p>
              <p className="text-xs text-gray-600">Conversions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-600">CVR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
