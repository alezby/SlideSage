
import type { Presentation, Slide } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const SLIDES_API_URL = 'https://slides.googleapis.com/v1/presentations';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

// A simple cache to avoid re-fetching the same image
const imageCache = new Map<string, string>();

async function getSlideImageUrl(presentationId: string, pageObjectId: string, token: string): Promise<string> {
  const cacheKey = `${presentationId}-${pageObjectId}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `${SLIDES_API_URL}/${presentationId}/pages/${pageObjectId}/thumbnail`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      // Fallback to a placeholder if thumbnail fails
      return PlaceHolderImages[0].imageUrl;
    }
    const thumbnailData = await response.json();
    const imageUrl = thumbnailData.contentUrl;
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Failed to fetch slide thumbnail:', error);
    return PlaceHolderImages[0].imageUrl; // Fallback image
  }
}

function extractTextFromPage(page: any): string {
    let text = '';
    if (page.pageElements) {
        for (const element of page.pageElements) {
            if (element.shape && element.shape.text) {
                for (const textRun of element.shape.text.textElements) {
                    if (textRun.textRun && textRun.textRun.content) {
                        text += textRun.textRun.content;
                    }
                }
            }
        }
    }
    return text.replace(/\s+/g, ' ').trim();
}


export async function getPresentations(token: string): Promise<Presentation[]> {
  const response = await fetch(
    `${DRIVE_API_URL}?q=mimeType='application/vnd.google-apps.presentation'&fields=files(id,name,thumbnailLink)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch presentations');
  }

  const data = await response.json();

  const presentations: Presentation[] = await Promise.all(
    data.files.map(async (file: any): Promise<Presentation> => {
      const presResponse = await fetch(`${SLIDES_API_URL}/${file.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const presData = await presResponse.json();

      const slides: Slide[] = await Promise.all(
        presData.slides.map(async (slideData: any, index: number): Promise<Slide> => {
          const pageObjectId = slideData.objectId;
          const imageUrl = await getSlideImageUrl(file.id, pageObjectId, token);
          const content = extractTextFromPage(slideData);
          const title = content.split('\n')[0] || `Slide ${index + 1}`;


          return {
            id: pageObjectId,
            title: title,
            content: content.substring(title.length).trim(),
            image: {
              id: pageObjectId,
              imageUrl: imageUrl,
              description: title,
              imageHint: 'presentation slide',
            },
          };
        })
      );

      return {
        id: file.id,
        title: file.name,
        slides,
      };
    })
  );

  return presentations;
}
