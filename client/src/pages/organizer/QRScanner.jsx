import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationService, eventService } from '../../services';
import Button from '../../components/common/Button';
import { HiOutlineArrowLeft, HiOutlineCamera, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './QRScanner.css';

const QRScanner = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getEvent(eventId);
        setEvent(data.data.event);
      } catch (error) {
        toast.error('Event not found');
        navigate('/organizer');
      }
    };
    fetchEvent();

    return () => {
      stopCamera();
    };
  }, [eventId]);

  const startCamera = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleQRData(decodedText);
          stopCamera();
        },
        () => {}
      );

      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera. Use manual input instead.');
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error('Stop camera error:', err);
    }
    setCameraActive(false);
  };

  const handleQRData = async (qrData) => {
    setVerifying(true);
    setResult(null);

    try {
      const { data } = await registrationService.verifyQR(qrData);
      setResult({
        success: true,
        message: data.message,
        attendee: data.data.attendeeName,
        email: data.data.attendeeEmail,
        ticketId: data.data.registration?.ticketId,
      });
      toast.success(`✅ ${data.data.attendeeName} checked in!`);
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      setResult({
        success: false,
        message,
      });
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    try {
      JSON.parse(manualInput);
      handleQRData(manualInput);
    } catch {
      // If not JSON, try to construct QR data from ticket ID
      handleQRData(JSON.stringify({ ticketId: manualInput.trim(), eventId }));
    }
    setManualInput('');
  };

  const resetScanner = () => {
    setResult(null);
    setManualInput('');
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <button className="event-detail-back" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft size={20} /> Back
        </button>

        <div className="qr-scanner-card glass-card animate-fade-in-up">
          <div className="qr-scanner-header">
            <h1 className="page-title">
              <HiOutlineCamera style={{ verticalAlign: 'middle' }} /> QR Check-in
            </h1>
            {event && (
              <p className="page-subtitle">{event.title}</p>
            )}
          </div>

          {/* Result Display */}
          {result && (
            <div className={`qr-result ${result.success ? 'qr-result-success' : 'qr-result-error'} animate-fade-in-scale`}>
              <div className="qr-result-icon">
                {result.success ? (
                  <HiOutlineCheckCircle size={48} />
                ) : (
                  <HiOutlineXCircle size={48} />
                )}
              </div>
              <h3>{result.success ? 'Check-in Successful!' : 'Verification Failed'}</h3>
              <p>{result.message}</p>
              {result.attendee && (
                <div className="qr-result-details">
                  <p><strong>Name:</strong> {result.attendee}</p>
                  <p><strong>Email:</strong> {result.email}</p>
                  {result.ticketId && <p><strong>Ticket:</strong> {result.ticketId}</p>}
                </div>
              )}
              <Button variant="primary" onClick={resetScanner} style={{ marginTop: 'var(--space-md)' }}>
                Scan Next
              </Button>
            </div>
          )}

          {/* Scanner Area */}
          {!result && (
            <>
              <div className="qr-camera-section">
                <div id="qr-reader" ref={scannerRef} className="qr-reader-container" />
                {!cameraActive && (
                  <div className="qr-camera-placeholder">
                    <HiOutlineCamera size={40} />
                    <p>Camera preview will appear here</p>
                    <Button variant="primary" onClick={startCamera} icon={<HiOutlineCamera />}>
                      Start Camera
                    </Button>
                  </div>
                )}
                {cameraActive && (
                  <Button variant="ghost" size="sm" onClick={stopCamera} style={{ marginTop: 'var(--space-sm)' }}>
                    Stop Camera
                  </Button>
                )}
              </div>

              <div className="qr-divider">
                <span>or enter manually</span>
              </div>

              <form onSubmit={handleManualSubmit} className="qr-manual-form">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste QR data or Ticket ID..."
                  className="home-search-input"
                  id="manual-qr-input"
                />
                <Button type="submit" variant="primary" loading={verifying}>
                  Verify
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
