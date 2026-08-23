import React, { useEffect } from 'react';
import { LatLng } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  X,
  Radio,
  PhoneCall,
  MessageSquare,
  MapPin,
} from 'lucide-react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPosition: LatLng | null;
  onTriggerSOS: (lat: number, lng: number) => Promise<any>;
  onCancelSOS: (sosId: string) => Promise<any>;
}

export const EMERGENCY_PHONE = '7991410190';
export const EMERGENCY_PHONE_FULL = '917991410190';
export const EMERGENCY_PHONE_DISPLAY = '+91 7991410190';

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  userPosition,
  onTriggerSOS,
  onCancelSOS,
}) => {
  const lat = userPosition?.lat || 28.6139;
  const lng = userPosition?.lng || 77.2090;
  const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
  const emergencyMessage = `🚨 EMERGENCY SOS ALERT! I need immediate help. My live GPS location: ${mapsUrl}`;
  const whatsAppUrl = `https://wa.me/${EMERGENCY_PHONE_FULL}?text=${encodeURIComponent(emergencyMessage)}`;
  const smsUrl = `sms:${EMERGENCY_PHONE}?body=${encodeURIComponent(emergencyMessage)}`;

  useEffect(() => {
    if (isOpen) {
      onTriggerSOS(lat, lng);
      const timer = setTimeout(() => {
        try {
          window.open(whatsAppUrl, '_blank');
        } catch (e) {
          console.warn('WhatsApp launch error:', e);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sos-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            key="sos-panel"
            initial={{ opacity: 0, scale: 0.88, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="bg-white rounded-2xl w-full max-w-sm shadow-google-lg overflow-hidden border border-slate-200 relative my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              className="bg-rose-600 px-5 py-3.5 flex items-center justify-between text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                >
                  <AlertOctagon className="w-5 h-5 fill-white text-rose-600" />
                </motion.div>
                <span className="font-bold text-sm">EMERGENCY SOS</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-rose-700 text-rose-100 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Content */}
            <div className="p-5 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.15 }}
                className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Radio className="w-7 h-7 text-emerald-600" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-base font-bold text-slate-900">SOS Active</h3>
                <p className="text-xs text-slate-500 mt-0.5">Contact: {EMERGENCY_PHONE_DISPLAY}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 flex items-center justify-center gap-1.5 font-mono"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
              </motion.div>

              {/* Action Buttons - staggered */}
              <div className="space-y-2 pt-1">
                {[
                  {
                    href: whatsAppUrl,
                    target: '_blank',
                    className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                    icon: <MessageSquare className="w-4 h-4" />,
                    label: `Send WhatsApp SOS (${EMERGENCY_PHONE_DISPLAY})`,
                  },
                  {
                    href: `tel:${EMERGENCY_PHONE}`,
                    className: 'bg-rose-600 hover:bg-rose-700 text-white',
                    icon: <PhoneCall className="w-4 h-4" />,
                    label: `Direct Call (${EMERGENCY_PHONE_DISPLAY})`,
                  },
                  {
                    href: smsUrl,
                    className: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
                    label: 'Send SMS Location',
                  },
                ].map((btn, i) => (
                  <motion.a
                    key={i}
                    href={btn.href}
                    target={btn.target}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors ${btn.className}`}
                  >
                    {btn.icon}
                    <span>{btn.label}</span>
                  </motion.a>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
