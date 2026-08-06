"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

export interface QRScannerProps {
  onScanSuccess: (data: CCCDData) => void;
  onClose: () => void;
}

export interface CCCDData {
  cccdNumber: string;
  oldCmnd: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issueDate: string;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanningMode, setScanningMode] = useState<'camera' | 'file'>('camera');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  const [zoomLevel, setZoomLevel] = useState<number>(1.8);
  const zoomLevelRef = useRef<number>(1.8);
  const [maxZoomSupported, setMaxZoomSupported] = useState<number>(3);

  const parseCCCDData = useCallback((decodedText: string) => {
    console.log("Scanned QR:", decodedText);
    const parts = decodedText.split('|');
    if (parts.length >= 6) {
      const data: CCCDData = {
        cccdNumber: parts[0]?.trim() || '',
        oldCmnd: parts[1]?.trim() || '',
        fullName: parts[2]?.trim() || '',
        dateOfBirth: parts[3]?.trim() || '',
        gender: parts[4]?.trim() || '',
        address: parts[5]?.trim() || '',
        issueDate: parts[6]?.trim() || '',
      };
      
      stopCamera();
      onScanSuccessRef.current(data);
      return true;
    } else {
      setError(`Dữ liệu không đúng chuẩn CCCD: ${decodedText.substring(0, 30)}...`);
      return false;
    }
  }, []);

  const changeZoom = async (newZoom: number) => {
    setZoomLevel(newZoom);
    zoomLevelRef.current = newZoom;

    if (streamRef.current) {
      try {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.applyConstraints === 'function') {
          await videoTrack.applyConstraints({ advanced: [{ zoom: newZoom } as any] });
        }
      } catch (err) {
        console.warn("Hardware zoom constraint note:", err);
      }
    }
  };

  const tick = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      // 1. Try Hardware-Accelerated Native BarcodeDetector API (Android Chrome / Samsung Internet)
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          const detectedBarcodes = await detector.detect(video);
          if (detectedBarcodes && detectedBarcodes.length > 0) {
            const rawVal = detectedBarcodes[0].rawValue;
            if (rawVal) {
              const success = parseCCCDData(rawVal);
              if (success) return;
            }
          }
        } catch (bErr) {
          // Fallback to jsQR below
        }
      }

      // 2. Guaranteed Digital Canvas Zoom + Multi-Pass Scanning
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;

      if (vWidth > 0 && vHeight > 0) {
        const currentZoom = zoomLevelRef.current || 1.8;
        
        // Compute digitally zoomed crop box
        const cropWidth = vWidth / currentZoom;
        const cropHeight = vHeight / currentZoom;
        const cropX = (vWidth - cropWidth) / 2;
        const cropY = (vHeight - cropHeight) / 2;

        const targetDim = 640;
        canvas.width = targetDim;
        canvas.height = targetDim;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, targetDim, targetDim);
          const imageData = ctx.getImageData(0, 0, targetDim, targetDim);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          
          if (code) {
            const success = parseCCCDData(code.data);
            if (success) return; // Stop ticking if success
          }
        }
      }
    }

    if (isMounted.current && streamRef.current) {
      requestRef.current = requestAnimationFrame(tick);
    }
  }, [parseCCCDData]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setError('');
    setScanningMode('camera');
    try {
      stopCamera();
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      }

      if (!isMounted.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      // Check zoom capabilities
      try {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
          const capabilities: any = videoTrack.getCapabilities();
          const advancedConstraints: any = {};
          
          if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
            advancedConstraints.focusMode = 'continuous';
          }
          if (capabilities.zoom) {
            setMaxZoomSupported(capabilities.zoom.max || 3);
            const targetZoom = Math.min(Math.max(zoomLevel, capabilities.zoom.min || 1), capabilities.zoom.max || 3);
            advancedConstraints.zoom = targetZoom;
          }

          if (Object.keys(advancedConstraints).length > 0) {
            await videoTrack.applyConstraints({ advanced: [advancedConstraints] });
          }
        }
      } catch (advancedErr) {
        console.warn("Camera advanced capabilities note:", advancedErr);
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== 'AbortError') throw playErr;
          return;
        }

        if (!isMounted.current) return;
        setIsCameraActive(true);
        requestRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      if (isMounted.current) {
        console.error("Camera access error:", err);
        setError(`Không thể mở camera (${err.name || err.message}). Vui lòng cấp quyền hoặc dùng chức năng chọn ảnh.`);
        setScanningMode('file');
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // 1. Try Hardware-Accelerated BarcodeDetector on raw uploaded Image
        if ('BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const detectedBarcodes = await detector.detect(img);
            if (detectedBarcodes && detectedBarcodes.length > 0 && detectedBarcodes[0].rawValue) {
              parseCCCDData(detectedBarcodes[0].rawValue);
              return;
            }
          } catch (bErr) {
            console.warn("BarcodeDetector image upload fallback:", bErr);
          }
        }

        // 2. Multi-Scale Downsampling for jsQR (Fixes 12MP/48MP mobile camera photo sizes)
        const maxDimensions = [1000, 800, 600, Math.max(img.width, img.height)];

        for (const maxDim of maxDimensions) {
          let scale = 1;
          if (img.width > maxDim || img.height > maxDim) {
            scale = maxDim / Math.max(img.width, img.height);
          }

          const targetW = Math.round(img.width * scale);
          const targetH = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const imageData = ctx.getImageData(0, 0, targetW, targetH);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });

            if (code) {
              parseCCCDData(code.data);
              return;
            }
          }
        }

        setError("Không tìm thấy mã QR trên ảnh. Vui lòng chọn ảnh chụp thẳng góc, đủ sáng và không bị che khuất mã QR.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '1rem', background: '#fff', borderRadius: '0.5rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' }}>
        Quét thông tin Căn cước công dân
      </h3>
      
      {error && (
        <div style={{ 
          color: '#b91c1c', background: '#fef2f2', border: '1px solid #f87171',
          padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' 
        }}>
          {error}
        </div>
      )}

      {scanningMode === 'camera' ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'hidden', borderRadius: '0.5rem', background: '#000' }}>
          <video 
            ref={videoRef} 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
            muted 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {!isCameraActive && !error && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff' }}>
              Đang mở camera...
            </div>
          )}
          {/* Scanning frame overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ 
              width: '220px', height: '220px',
              position: 'relative' 
            }}>
              {/* Top Left */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff', borderRadius: '4px 0 0 0' }}></div>
              {/* Top Right */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '4px solid #fff', borderRight: '4px solid #fff', borderRadius: '0 4px 0 0' }}></div>
              {/* Bottom Left */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff', borderRadius: '0 0 0 4px' }}></div>
              {/* Bottom Right */}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff', borderRadius: '0 0 4px 0' }}></div>
              
              <div style={{ position: 'absolute', bottom: '-40px', left: '-50%', right: '-50%', textAlign: 'center', color: '#fff', fontSize: '0.85rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                Đưa mã QR trên thẻ CCCD vào khung
              </div>
            </div>
          </div>

          {/* Zoom Controls Overlay (Supports Hardware + Digital Canvas Zoom) */}
          <div style={{
            position: 'absolute', bottom: '12px', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', zIndex: 10
          }}>
            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
              Zoom:
            </span>
            {[1, 1.5, 2, 2.5].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => changeZoom(z)}
                style={{
                  background: zoomLevel === z ? '#2563eb' : 'rgba(0, 0, 0, 0.7)',
                  color: '#fff', border: '1px solid rgba(255,255,255,0.5)',
                  padding: '0.25rem 0.65rem', borderRadius: '1rem',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {z}x
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '2px dashed #cbd5e1', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#64748b' }}>
            add_a_photo
          </span>
          <p style={{ margin: '1rem 0', color: '#475569', fontSize: '0.9rem' }}>
            Webcam không đủ độ nét. Vui lòng tải lên hoặc chụp ảnh CCCD trực tiếp.
          </p>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%', maxWidth: '300px' }}>
          <button 
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: '0.375rem',
              cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
              add_a_photo
            </span>
            {scanningMode === 'camera' ? 'Camera mờ? Chụp ảnh rõ nét hơn' : 'Chọn ảnh CCCD để quét'}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            onChange={handleFileUpload}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              opacity: 0, cursor: 'pointer'
            }}
          />
        </div>

        <button 
          onClick={() => { stopCamera(); onClose(); }}
          style={{
            width: '100%', maxWidth: '300px',
            padding: '0.75rem 1rem',
            background: '#e2e8f0', color: '#475569',
            border: 'none', borderRadius: '0.375rem',
            cursor: 'pointer', fontWeight: 600
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
