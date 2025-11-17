'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SlideViewer() {
  const {
    selectedPresentation,
    comments,
    setCurrentSlideIndex,
    currentSlideIndex,
  } = useDashboard();
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    api.on('select', () => {
      setCurrentSlideIndex(api.selectedScrollSnap());
    });
  }, [api, setCurrentSlideIndex]);

  useEffect(() => {
    if (!api) return;
    if (currentSlideIndex !== api.selectedScrollSnap()) {
      api.scrollTo(currentSlideIndex);
    }
  }, [currentSlideIndex, api]);

  if (!selectedPresentation) {
    return null;
  }

  return (
    <Carousel setApi={setApi} className="w-full">
      <CarouselContent>
        {selectedPresentation.slides.map((slide, index) => {
          const slideComments = comments.filter(
            (c) => c.slideNumber === index + 1
          );
          return (
            <CarouselItem key={slide.id}>
              <Card
                className="overflow-hidden relative transition-all"
                data-has-comments={slideComments.length > 0 ? 'true' : 'false'}
              >
                {slideComments.length > 0 && (
                  <div className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground shadow-lg">
                    {slideComments.length}
                  </div>
                )}
                <CardContent className="p-0 aspect-video relative">
                  <Image
                    src={selectedPresentation.thumbnailUrl || slide.image.imageUrl}
                    alt={slide.image.description}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={slide.image.imageHint}
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-8 text-white">
                    <h2 className="font-headline text-4xl font-bold drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="max-w-3xl text-xl drop-shadow-md">
                      {slide.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
