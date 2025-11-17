import type { Presentation, Slide } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const SLIDES_API_URL = 'https://slides.googleapis.com/v1/presentations';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

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

      if (!presResponse.ok) {
        console.error(`Failed to fetch presentation details for ${file.name}`);
        // Return a presentation object with an empty slides array or handle as needed
        return {
          id: file.id,
          title: file.name,
          thumbnailUrl: file.thumbnailLink,
          slides: [],
        };
      }
      
      const presData = await presResponse.json();

      const slides: Slide[] = await Promise.all(
        (presData.slides || []).map(async (slideData: any, index: number): Promise<Slide> => {
          const pageObjectId = slideData.objectId;
          const content = extractTextFromPage(slideData);
          const title = content.split('\n')[0] || `Slide ${index + 1}`;

          return {
            id: pageObjectId,
            title: title,
            content: content.substring(title.length).trim(),
            image: {
              id: pageObjectId,
              imageUrl: file.thumbnailLink,
              description: title,
              imageHint: 'presentation slide',
            },
          };
        })
      );

      return {
        id: file.id,
        title: file.name,
        thumbnailUrl: file.thumbnailLink,
        slides,
      };
    })
  );

  return presentations.filter(p => p.slides.length > 0);
}
