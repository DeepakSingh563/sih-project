import React, { useState, useEffect } from 'react';
import { CommunityReport, AIAgentLog, Incident } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  X,
  CheckCircle2,
  Activity,
  BarChart3,
  Shield,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  reports: CommunityReport[];
  agentLogs: AIAgentLog[];
  incidents: Incident[];
  onVerifyReport: (id: string) => Promise<any>;
  onRejectReport: (id: string) => Promise<any>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  reports,
  agentLogs,
  incidents,
  onVerifyReport,
  onRejectReport,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'ai_ops' | 'stats'>('queue');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const highCount = incidents.filter((i) => i.severity === 'high').length;

  const handleVerify = async (id: string) => {
    setProcessingId(id);
    await onVerifyReport(id);
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await onRejectReport(id);
    setProcessingId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="admin-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            key="admin-panel"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="bg-white rounded-2xl w-full max-w-2xl shadow-google-lg overflow-hidden border border-slate-200 relative my-8 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Cpu className="w-4 h-4" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Safety Operations & AI Telemetry</h3>
                  <p className="text-xs text-slate-500">Incident moderation & live agent latency metrics</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Tab Switcher */}
            <div className="px-6 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-white">
              {[
                { id: 'queue', label: `Review Queue (${pendingReports.length})`, color: 'blue' },
                { id: 'ai_ops', label: `AI Agents (${agentLogs.length})`, color: 'purple' },
                { id: 'stats', label: 'City Analytics', color: 'emerald' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors relative ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200`
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-full border border-current opacity-30"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {activeTab === 'queue' && (
                  <motion.div
                    key="tab-queue"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {pendingReports.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500"
                      >
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <span>No pending reports requiring moderation!</span>
                      </motion.div>
                    ) : (
                      pendingReports.map((report, i) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold capitalize text-slate-900">
                                {report.incident_type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                {report.severity}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-700">
                              {Math.round(report.confidence * 100)}% Score
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{report.description}</p>
                          <div className="text-xs text-slate-400 font-medium">{report.address}</div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <motion.button
                              onClick={() => handleVerify(report.id)}
                              disabled={processingId === report.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.96 }}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify & Add to Map</span>
                            </motion.button>
                            <motion.button
                              onClick={() => handleReject(report.id)}
                              disabled={processingId === report.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.96 }}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs transition-colors"
                            >
                              Reject
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'ai_ops' && (
                  <motion.div
                    key="tab-ai"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {agentLogs.map((log, i) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.22 }}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{log.agent_name}</div>
                          <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                            {log.operation}
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.06 + 0.1, type: 'spring', stiffness: 300 }}
                            className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md inline-block"
                          >
                            {log.execution_time_ms} ms
                          </motion.span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div
                    key="tab-stats"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Total Incidents', value: incidents.length, color: 'slate' },
                        { label: 'High & Critical Zones', value: criticalCount + highCount, color: 'rose' },
                        { label: 'Community Reports', value: reports.length, color: 'blue' },
                        { label: 'AI Agents Active', value: 7, color: 'purple' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 280 }}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 + 0.1 }}
                            className={`text-2xl font-bold mt-1 ${stat.color === 'rose' ? 'text-rose-600' : stat.color === 'blue' ? 'text-blue-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-slate-900'}`}
                          >
                            {stat.value}
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
