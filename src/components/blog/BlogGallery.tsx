'use client'

import { useState } from 'react'
import { Image as ImageIcon, X, ZoomIn } from 'lucide-react'

export default function BlogGallery({ additionalImages }: { additionalImages: string[] }) {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  if (!additionalImages || additionalImages.length === 0) return null

  return (
    <div className="flex flex-col gap-4 border-t border-white/5 pt-8 mt-4 text-left">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-yellow-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-white">Galería del Capítulo</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
        {additionalImages.map((imgUrl, idx) => (
          <div 
            key={idx} 
            onClick={() => setActiveImage(imgUrl)}
            className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 group cursor-pointer shadow-lg"
          >
            <img 
              src={imgUrl} 
              alt={`Galería adicional ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-3 rounded-full bg-yellow-500 text-black scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Lightbox / Modal Portal */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-10 select-none animate-fadeIn cursor-zoom-out"
        >
          {/* Close button */}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setActiveImage(null)
            }}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-yellow-500 hover:scale-105 transition-all text-white cursor-pointer shadow-lg z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Centered fully uncropped image */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-full max-h-[85vh] overflow-hidden flex items-center justify-center"
          >
            <img 
              src={activeImage} 
              alt="Gallery Lightbox Expanded" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl select-none animate-scaleIn"
            />
          </div>
        </div>
      )}
    </div>
  )
}
