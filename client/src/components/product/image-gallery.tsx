'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ImageGallery({ images, productName, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasImages = images.length > 0;
  const currentImage = images[selectedIndex];

  const goTo = (index: number) => {
    if (index < 0) setSelectedIndex(images.length - 1);
    else if (index >= images.length) setSelectedIndex(0);
    else setSelectedIndex(index);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-[2rem] border border-white/8 bg-muted">
        {hasImages ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative h-full w-full"
              >
                <Image
                  src={currentImage}
                  alt={`${productName} - Image ${selectedIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={selectedIndex === 0}
                />
              </motion.div>
            </AnimatePresence>

            {/* Zoom button */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/56 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
              <ZoomIn className="size-4" />
            </button>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => goTo(selectedIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/56 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => goTo(selectedIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/56 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}

            {/* Dots (mobile) */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === selectedIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                    )}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No images available
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="hidden gap-3 sm:flex">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                i === selectedIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && hasImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImage}
                alt={productName}
                width={1200}
                height={1200}
                className="max-h-[90vh] w-auto rounded-lg object-contain"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goTo(selectedIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goTo(selectedIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                </>
              )}

              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
