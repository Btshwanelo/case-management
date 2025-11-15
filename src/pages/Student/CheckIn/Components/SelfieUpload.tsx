import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface NativeCameraProps {
  onBack: () => void;
  onCapture: (photo: string) => void;
  onClose: () => void;
}

const NativeCamera = ({ onBack, onCapture, onClose }: NativeCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [isMobile] = useState(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });

  useEffect(() => {
    const initCamera = async () => {
      try {
        // Try to get the camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isMobile ? { exact: 'user' } : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        // Store stream reference for cleanup
        streamRef.current = stream;

        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setHasPermission(true);
      } catch (err) {
        console.error('Camera initialization error:', err);

        // Try fallback constraints if initial attempt fails
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });

          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }

          setHasPermission(true);
        } catch (fallbackErr) {
          console.error('Fallback camera error:', fallbackErr);
          setError('Unable to access camera. Please check permissions and try again.');
          setHasPermission(false);
        }
      }
    };

    initCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMobile]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Flip horizontally for selfie view if on front camera
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Convert to base64
      const photoData = canvas.toDataURL('image/jpeg');
      onCapture(photoData);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={onBack}>Try Again</Button>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Camera access is required. Please check your browser settings and permissions.</AlertDescription>
        </Alert>
        <Button onClick={onBack}>Back</Button>
      </div>
    );
  }

  const progressValue = Math.min(100, Math.max(0, (6 / 10) * 100));

  return (
    <div className="fixed inset-0 flex flex-col max-w-lg mx-auto bg-gray-900">
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <CardHeader className="flex-shrink-0 space-y-4 pb-0 px-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" className="text-white hover:text-gray-300" onClick={onBack}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button variant="ghost" className="text-white hover:text-gray-300" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="space-y-1">
            <Progress value={progressValue} className="h-2" />
            <div className="text-right text-sm text-white">{progressValue}%</div>
          </div>
        </CardHeader>

        <p className="text-white font-medium text-center py-2">Take a clear picture of your face</p>

        <div className="flex-1 relative min-h-0">
          <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex-shrink-0 flex justify-center p-4">
          <Button
            size="lg"
            variant="outline"
            className={`h-16 w-16 rounded-full border-4 ${
              isCapturing ? 'border-orange-500' : 'border-white'
            } hover:border-orange-500 transition-colors flex items-center justify-center`}
            onClick={capture}
            disabled={isCapturing}
          >
            <div className={`h-12 w-12 rounded-full ${isCapturing ? 'bg-orange-500' : 'bg-white'} hover:bg-orange-500 transition-colors`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NativeCamera;
