import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import ShoppableVideoModal from '../../components/storefront/ShoppableVideoModal';
import Icons from '../../components/common/Icons';

export const ShoppableVideosPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadVideos() {
      setLoading(true);
      try {
        const res = await api.shoppableVideos.getAll();
        if (mounted && res.success) {
          setVideos(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load videos:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadVideos();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
          <Icons.Video className="w-3.5 h-3.5" />
          Interactive Lookbooks
        </span>
        <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
          Shoppable Video Feed
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Watch handlooms flow, ceramics throw, and styling in motion. Tap any reel to inspect and buy directly.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="aspect-4/5 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              onClick={() => setSelectedVideo(video)}
              className="group relative aspect-4/5 rounded-3xl overflow-hidden cursor-pointer shadow-lg bg-slate-900 border border-slate-200/80"
            >
              <img
                src={video.thumbnailUrl || video.videoUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900 transition-all shadow-xl">
                  <Icons.Play className="w-6 h-6 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Video Meta */}
              <div className="absolute bottom-5 left-5 right-5 text-left space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Icons.Eye className="w-3.5 h-3.5" />
                    {video.views || 0}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Icons.Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    {video.likes || 0}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{video.title}</h3>
                <p className="text-xs font-mono font-bold text-emerald-400">
                  Featured: ₹{video.product?.salePrice || video.product?.price || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-xs text-slate-500">
          No shoppable video reels are currently published.
        </div>
      )}

      <ShoppableVideoModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
      />
    </div>
  );
};

export default ShoppableVideosPage;
