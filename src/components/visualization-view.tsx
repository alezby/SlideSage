'use client';

import { useDashboard } from '@/contexts/dashboard-context';
import { useUser } from '@/firebase';
import { getSlideThumbnail } from '@/services/google-slides';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VisualizationView() {
    const { selectedPresentation, comments } = useDashboard();
    const { user } = useUser();
    const router = useRouter();
    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
    const [loadingThumbnails, setLoadingThumbnails] = useState(false);

    useEffect(() => {
        const fetchThumbnails = async () => {
            if (!selectedPresentation || !user) return;

            setLoadingThumbnails(true);
            const token = sessionStorage.getItem('google_access_token');
            if (!token) {
                console.error('No access token found');
                setLoadingThumbnails(false);
                return;
            }

            const newThumbnails: Record<string, string> = {};

            // Create a promise for each slide to fetch its thumbnail
            const promises = selectedPresentation.slides.map(async (slide) => {
                const url = await getSlideThumbnail(token, selectedPresentation.id, slide.id);
                if (url) {
                    newThumbnails[slide.id] = url;
                }
            });

            await Promise.all(promises);
            setThumbnails(newThumbnails);
            setLoadingThumbnails(false);
        };

        fetchThumbnails();
    }, [selectedPresentation, user]);

    if (!selectedPresentation) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-muted-foreground">No presentation selected.</p>
                <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Analysis Report</h1>
                        <p className="text-muted-foreground">{selectedPresentation.title}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8">
                {selectedPresentation.slides.map((slide, index) => {
                    const slideComments = comments.filter((c) => c.slideNumber === index + 1);
                    const hasComments = slideComments.length > 0;

                    return (
                        <Card key={slide.id} className={`overflow-hidden ${hasComments ? 'border-primary/50' : ''}`}>
                            <CardHeader className="bg-muted/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-medium">
                                        Slide {index + 1}: {slide.title}
                                    </CardTitle>
                                    {hasComments && (
                                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                            {slideComments.length} Suggestion{slideComments.length !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid md:grid-cols-2 gap-0">
                                    {/* Slide Thumbnail */}
                                    <div className="bg-black/5 p-6 flex items-center justify-center min-h-[300px] border-r border-border/50">
                                        {loadingThumbnails ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        ) : thumbnails[slide.id] ? (
                                            <img
                                                src={thumbnails[slide.id]}
                                                alt={`Slide ${index + 1}`}
                                                className="rounded shadow-lg max-h-[250px] w-auto object-contain"
                                            />
                                        ) : (
                                            <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                                                <div className="h-32 w-48 bg-muted rounded border-2 border-dashed border-muted-foreground/25" />
                                                <span>Thumbnail unavailable</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments & Content */}
                                    <div className="p-6 flex flex-col gap-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                                AI Recommendations
                                            </h4>
                                            {hasComments ? (
                                                <ul className="space-y-3">
                                                    {slideComments.map((comment, i) => (
                                                        <li key={i} className="bg-accent/50 p-3 rounded-md text-sm border border-accent">
                                                            {comment.commentText}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    No specific recommendations for this slide. Great job!
                                                </p>
                                            )}
                                        </div>

                                        {/* Slide Content Preview (Optional/Collapsible could be added here) */}
                                        <div className="mt-auto pt-4 border-t">
                                            <p className="text-xs text-muted-foreground line-clamp-3">
                                                <span className="font-semibold">Content Preview:</span> {slide.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
