import { useCallback, useEffect, useRef, useState } from 'react';

/* ============================================================================
   useCamera — a resilient wrapper around navigator.mediaDevices.getUserMedia.

   States: idle → requesting → live | denied | nodevice | inuse | insecure |
           error | stopped

   Every failure mode is classified so the UI can explain what went wrong and
   offer a graceful Studio Mode fallback instead of a dead screen.
   ========================================================================== */

const PERMISSIONS = {
  granted: 'granted',
  denied: 'denied',
  prompt: 'prompt',
};

function classifyError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return {
        state: 'denied',
        title: 'Camera permission declined',
        message:
          'Your browser blocked access to the camera. Enable the camera for this site in your browser settings, then try again — or continue in Studio Mode.',
      };
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        state: 'nodevice',
        title: 'No camera detected',
        message:
          'We could not find a camera on this device. Connect one and retry, or explore the collection in Studio Mode.',
      };
    case 'NotReadableError':
    case 'TrackStartError':
      return {
        state: 'inuse',
        title: 'Camera is busy',
        message:
          'Another application is using your camera. Close it (video calls are the usual culprit) and try again.',
      };
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return {
        state: 'error',
        title: 'Camera mode unavailable',
        message:
          'Your camera cannot provide the requested video mode. Try the standard quality instead.',
      };
    case 'AbortError':
      return {
        state: 'error',
        title: 'Camera start interrupted',
        message: 'The camera could not be started. Please try again.',
      };
    default:
      return {
        state: 'error',
        title: 'Camera unavailable',
        message: err?.message || 'Something unexpected happened while starting the camera.',
      };
  }
}

export function useCamera({ facingMode = 'user' } = {}) {
  const [status, setStatus] = useState('idle'); // idle | requesting | live | <error>
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const [trackSettings, setTrackSettings] = useState(null);
  const [permission, setPermission] = useState('unknown');
  const [stream, setStream] = useState(null);

  const streamRef = useRef(null);
  const mountedRef = useRef(true);
  const facingRef = useRef(facingMode);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => {
      try {
        t.stop();
      } catch {
        /* already stopped */
      }
    });
    streamRef.current = null;
    setStream(null);
    setTrackSettings(null);
    setStatus((s) => (s === 'live' ? 'stopped' : s));
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter((d) => d.kind === 'videoinput'));
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(
    async ({ deviceId, facing = facingRef.current, quality = 'ideal' } = {}) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError({
          state: 'insecure',
          title: 'Camera not supported here',
          message:
            'This browser does not expose a camera API on the current origin. A secure (HTTPS or localhost) connection is required for live video.',
        });
        setStatus('insecure');
        return null;
      }

      setStatus('requesting');
      setError(null);

      const hd = quality === 'hd';
      const video = {
        facingMode: deviceId ? undefined : facing,
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        width: { ideal: hd ? 1920 : 1280 },
        height: { ideal: hd ? 1080 : 720 },
        frameRate: { ideal: 30, max: 60 },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video,
          audio: false,
        });

        if (!mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return null;
        }

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        setStream(stream);
        facingRef.current = facing;

        const [track] = stream.getVideoTracks();
        const settings = track?.getSettings?.() || {};
        setTrackSettings({
          width: settings.width || 0,
          height: settings.height || 0,
          label: settings.deviceLabel || 'Camera',
          facingMode: settings.facingMode || facing,
        });
        if (track?.label) setActiveDeviceId(settings.deviceId || null);

        // device labels are only exposed once permission is granted
        refreshDevices();

        track?.addEventListener?.('ended', () => {
          setStatus((s) => (s === 'live' ? 'stopped' : s));
        });

        setStatus('live');
        setPermission(PERMISSIONS.granted);
        return stream;
      } catch (err) {
        if (err?.name === 'AbortError' && !mountedRef.current) return null;
        const info = classifyError(err);
        setError(info);
        setStatus(info.state);
        if (info.state === 'denied') setPermission(PERMISSIONS.denied);
        return null;
      }
    },
    [refreshDevices]
  );

  /* Auto-start once permission is already granted (second visit). */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const st = await navigator.permissions?.query({
          name: 'camera',
          // Firefox throws on unsupported permission names; guard it.
        });
        if (cancelled) return;
        setPermission(st.state);
        if (st.state === 'granted' && status === 'idle') start();
        st.onchange = () => setPermission(st.state);
      } catch {
        if (!cancelled) setPermission('unknown');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Track hot-plug so the device list stays honest. */
  useEffect(() => {
    const md = navigator.mediaDevices;
    if (!md?.addEventListener) return undefined;
    const onChange = () => refreshDevices();
    md.addEventListener('devicechange', onChange);
    return () => md.removeEventListener('devicechange', onChange);
  }, [refreshDevices]);

  useEffect(() => stop, [stop]);

  const switchFacing = useCallback(
    (facing) => start({ facing }),
    [start]
  );

  const switchDevice = useCallback((deviceId) => start({ deviceId }), [start]);

  return {
    status,
    error,
    stream,
    devices,
    activeDeviceId,
    trackSettings,
    permission,
    start,
    stop,
    switchFacing,
    switchDevice,
    refreshDevices,
    isSupported: Boolean(
      typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia
    ),
    isSecure: typeof window === 'undefined' || window.isSecureContext,
  };
}
