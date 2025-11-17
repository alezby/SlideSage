import type { Presentation, Slide } from '@/lib/data';

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
    const errorBody = await response.text();
    console.error('Failed to fetch presentations from Drive:', response.status, errorBody);
    throw new Error(`Failed to fetch presentations. Status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.files) {
    return [];
  }

  const presentationPromises: Promise<Presentation | null>[] = data.files.map(async (file: any): Promise<Presentation | null> => {
    try {
      const presResponse = await fetch(`${SLIDES_API_URL}/${file.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!presResponse.ok) {
        console.error(`Failed to fetch presentation details for ${file.name} (${file.id}). Status: ${presResponse.status}`);
        return null;
      }
      
      const presData = await presResponse.json();

      if (!presData.slides || presData.slides.length === 0) {
        return {
          id: file.id,
          title: file.name,
          thumbnailUrl: file.thumbnailLink,
          slides: [],
        };
      }

      const slides: Slide[] = presData.slides.map((slideData: any, index: number): Slide => {
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
        });

      return {
        id: file.id,
        title: file.name,
        thumbnailUrl: file.thumbnailLink,
        slides,
      };
    } catch(error) {
      console.error(`Error processing presentation ${file.name} (${file.id}):`, error);
      return null;
    }
  });

  const resolvedPresentations = await Promise.all(presentationPromises);
  
  // Filter out nulls and presentations with no slides
  return resolvedPresentations.filter((p): p is Presentation => p !== null && p.slides.length > 0);
}
