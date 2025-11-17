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
import { useEffect, useState } from 'react';
import AnalysisPanel from './analysis-panel';

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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      <div className="lg:col-span-3 xl:col-span-4">
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
                    <CardContent className="p-0 aspect-video relative flex flex-col justify-center items-center bg-card">
                       <div className="p-8 text-center">
                        <h2 className="font-headline text-4xl font-bold">
                          {slide.title}
                        </h2>
                        <p className="max-w-3xl text-xl mt-4 text-muted-foreground">
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
      </div>
      <div className="lg:col-span-2 xl:col-span-1">
        <AnalysisPanel />
      </div>
    </div>
  );
}
