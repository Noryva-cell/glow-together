import { useEffect, useRef, useState } from 'react';
import { Camera, ImageIcon, Loader2, X, Zap, ZapOff } from 'lucide-react';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Prise de vue guidée : repère de cadrage, flash automatique (torche du téléphone
 * ou éclair plein écran) et secours vers l'appareil photo natif.
 */
export default function CameraCapture({ open, shot, onClose, onCapture, onFallback }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shooting, setShooting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setReady(false);
    setError('');
    setTorchOn(false);
    setTorchAvailable(false);

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        const track = stream.getVideoTracks()[0];
        const caps = track?.getCapabilities ? track.getCapabilities() : {};
        setTorchAvailable(Boolean(caps?.torch));
        setReady(true);
      } catch (e) {
        if (!cancelled) setError('Caméra indisponible ici. Utilise l’appareil photo de ton téléphone : il gère le flash tout seul.');
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open]);

  const setTorch = async (value) => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: value }] });
      setTorchOn(value);
    } catch (e) {
      setTorchAvailable(false);
    }
  };

  const shoot = async () => {
    if (!ready || shooting) return;
    setShooting(true);
    if (torchAvailable && !torchOn) {
      await setTorch(true);
      await wait(320);
    }
    setFlash(true);
    await wait(90);

    const video = videoRef.current;
    const width = video?.videoWidth || 900;
    const height = video?.videoHeight || 1200;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(video, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) onCapture(new File([blob], `mimo-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      setShooting(false);
    }, 'image/jpeg', 0.92);

    await wait(130);
    setFlash(false);
    if (torchAvailable) setTorch(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium">{shot?.label}</p>
          <p className="mt-0.5 text-[10.5px] leading-snug text-white/60">{shot?.hint}</p>
        </div>
        <button onClick={onClose} aria-label="Fermer" className="shrink-0 rounded-full bg-white/10 p-2">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[60%] w-[64%] rounded-[50%] border border-dashed border-white/45" />
        </div>
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {flash && <div className="pointer-events-none absolute inset-0 bg-white" />}
      </div>

      <div className="space-y-3 px-4 pb-6 pt-4">
        {error ? (
          <p className="rounded-xl bg-white/10 px-3 py-2 text-[11.5px] leading-relaxed text-white/80">{error}</p>
        ) : (
          <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-white/60">
            <Zap className="h-3 w-3" />
            Flash automatique {torchAvailable ? 'activé' : 'par l’éclairage de l’écran'}
          </p>
        )}

        <div className="flex items-center justify-around">
          <button onClick={onFallback} className="flex flex-col items-center gap-1 text-[10px] text-white/70">
            <ImageIcon className="h-5 w-5" />
            Appareil photo
          </button>
          <button
            onClick={shoot}
            disabled={!ready || shooting}
            aria-label="Prendre la photo"
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-white/25 disabled:opacity-50"
          >
            {shooting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          </button>
          <button
            onClick={() => setTorch(!torchOn)}
            disabled={!torchAvailable}
            className="flex flex-col items-center gap-1 text-[10px] text-white/70 disabled:opacity-40"
          >
            {torchOn ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
            Torche
          </button>
        </div>
      </div>
    </div>
  );
}