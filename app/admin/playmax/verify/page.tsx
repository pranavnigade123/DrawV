'use client';

import { useState, useEffect, useRef } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import PlaymaxRegistration from '@/lib/models/PlaymaxCampusLeague';
import AdminToolbar from '@/app/admin/admin-ui/AdminToolbar';
import jsQR from 'jsqr';
import toast from 'react-hot-toast';
import BorderMagicButton from '@/components/aceternity/BorderMagicButton';

export default function PlaymaxVerifyPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [registration, setRegistration] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Server-side auth check
  async function checkAuth() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      redirect('/unauthorized');
    }
  }
  checkAuth();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsScanning(true);
          scanQRCode();
        }
      } catch (err) {
        console.error('Camera access error:', err);
        toast.error('Failed to access camera. Please allow camera permissions.');
      }
    };

    const stopScanner = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsScanning(false);
    };

    if (isScanning) {
      startScanner();
    }

    return () => stopScanner();
  }, [isScanning]);

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      verifyRegistration(code.data);
    } else {
      requestAnimationFrame(scanQRCode);
    }
  };

  const verifyRegistration = async (registrationId: string) => {
    try {
      await connectDB();
      const response = await fetch('/api/playmax/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });
      const data = await response.json();

      if (response.ok) {
        setRegistration(data);
        toast.success('Registration verified!');
        setIsScanning(false);
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <AdminToolbar title="Playmax QR Verification" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-6">Verify Playmax Registration</h2>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Scan QR Code</h3>
          {!isScanning ? (
            <BorderMagicButton onClick={() => setIsScanning(true)}>
              Start QR Scanner
            </BorderMagicButton>
          ) : (
            <div className="flex flex-col items-center">
              <video ref={videoRef} className="w-full max-w-md rounded-lg" />
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={() => setIsScanning(false)}
                className="mt-4 px-6 py-3 bg-red-600 rounded font-semibold text-white hover:bg-red-700 transition"
              >
                Stop Scanner
              </button>
            </div>
          )}
          {registration && (
            <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Verified Registration</h3>
              <p><strong>Name:</strong> {registration.name}</p>
              <p><strong>Email:</strong> {registration.email}</p>
              <p><strong>Phone:</strong> {registration.phone}</p>
              {registration.game && <p><strong>Game:</strong> {registration.game}</p>}
              <p><strong>Registered At:</strong> {new Date(registration.createdAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}