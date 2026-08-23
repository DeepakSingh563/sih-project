import React, { useState, useEffect } from 'react';
import { NewsArticle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  X,
  RefreshCw,
} from 'lucide-react';

interface NewsFeedProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  onRefreshNews?: () => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  isOpen,
  onClose,
  articles,
  onRefreshNews,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleRefresh = async () => {
    if (onRefreshNews) {
      setRefreshing(true);
      await onRefreshNews();
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  const filteredArticles = articles.filter((art) => {
    if (selectedTag === 'all') return true;
    return art.ai_analysis?.incidentType === selectedTag;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="news-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            key="news-panel"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="bg-white rounded-2xl w-full max-w-xl shadow-google-lg overflow-hidden border border-slate-200 relative my-8 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Safety & Crime Intel Radar</h3>
                  <p className="text-xs text-slate-500">Extracted from Delhi NCR police bulletins & verified news</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  title="Refresh"
                >
                  <motion.div
                    animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'text-blue-600' : ''}`} />
                  </motion.div>
                </motion.button>
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
            </div>

            {/* Filter Pills */}
            <div className="px-6 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
              {['all', 'robbery', 'harassment', 'accident', 'snatching', 'protest'].map((tag, i) => (
                <motion.button
                  key={`tag-${tag}`}
                  onClick={() => setSelectedTag(tag)}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                    selectedTag === tag
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>

            {/* Article Cards */}
            <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
              <AnimatePresence mode="popLayout">
                {filteredArticles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    layout
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white cursor-default"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700">{article.source}</span>
                      <span>
                        {new Date(article.published_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                      {article.description}
                    </p>

                    {article.ai_analysis && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-blue-700 capitalize">
                            {article.ai_analysis.incidentType}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600">{article.ai_analysis.location}</span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {Math.round((article.ai_analysis.confidence || 0.8) * 100)}% Conf
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
