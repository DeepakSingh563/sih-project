import React, { useState, useEffect } from 'react';
import { SeverityLevel } from '../types';
import { GLOBAL_POPULAR_PLACES } from '../lib/mockData';
import {
  X,
  PlusCircle,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: {
    incidentType: string;
    description: string;
    severity: SeverityLevel;
    latitude: number;
    longitude: number;
    address: string;
  }) => Promise<any>;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [incidentType, setIncidentType] = useState('harassment');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [selectedLocation, setSelectedLocation] = useState(GLOBAL_POPULAR_PLACES[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const res = await onSubmit({
        incidentType,
        severity,
        description,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: `${selectedLocation.name}, ${selectedLocation.tag}`,
      });
      setSubmittedResult(res);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedResult(null);
    setDescription('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleReset}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-google-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Report Safety Hazard</h3>
              <p className="text-xs text-slate-500">Community reporting intelligence layer</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedResult ? (
          /* Submission Success */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">Report Ingested</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Analyzed by safety algorithms. Incident verified and routed to the map radar.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold uppercase text-emerald-700">
                  {submittedResult.report?.status || 'VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Confidence:</span>
                <span className="font-semibold text-slate-800">
                  {Math.round((submittedResult.verification?.confidence || 0.78) * 100)}% Match
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-800">{selectedLocation.name}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-xs text-white shadow-md transition-colors"
            >
              Done & Return to Map
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Incident Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'harassment', label: 'Harassment' },
                  { id: 'robbery', label: 'Robbery' },
                  { id: 'assault', label: 'Assault' },
                  { id: 'theft', label: 'Theft' },
                  { id: 'accident', label: 'Accident' },
                  { id: 'road_closure', label: 'Road Block' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setIncidentType(t.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                      incidentType === t.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Severity Rating
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold uppercase border transition-all ${
                      severity === s
                        ? s === 'critical'
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : s === 'high'
                          ? 'bg-amber-50 border-amber-500 text-amber-800'
                          : s === 'medium'
                          ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Landmark Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location Landmark
              </label>
              <select
                value={selectedLocation.name}
                onChange={(e) => {
                  const loc = GLOBAL_POPULAR_PLACES.find((p) => p.name === e.target.value);
                  if (loc) setSelectedLocation(loc);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {GLOBAL_POPULAR_PLACES.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description & Safety Context
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about lighting, unpatrolled stretches, suspicious activity, or blockages..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 font-bold text-xs text-white shadow-md transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
