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

export async function createSlide(
  token: string,
  presentationId: string,
  title: string,
  content: string
): Promise<string> {
  const url = `${SLIDES_API_URL}/${presentationId}:batchUpdate`;

  // Create a unique object ID for the new slide and its elements
  const slideId = `new_slide_${Date.now()}`;
  const titleId = `title_${Date.now()}`;
  const bodyId = `body_${Date.now()}`;

  const requests = [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: {
          predefinedLayout: 'TITLE_AND_BODY',
        },
        placeholderIdMappings: [
          {
            layoutPlaceholder: {
              type: 'TITLE',
            },
            objectId: titleId,
          },
          {
            layoutPlaceholder: {
              type: 'BODY',
            },
            objectId: bodyId,
          },
        ],
      },
    },
    {
      insertText: {
        objectId: titleId,
        text: title,
      },
    },
    {
      insertText: {
        objectId: bodyId,
        text: content,
      },
    },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Failed to create slide:', errorBody);
    throw new Error('Failed to create slide.');
  }

  const result = await response.json();
  const newSlideObjectId = result.replies[0].createSlide.objectId;
  console.log(`Slide created successfully with ID: ${newSlideObjectId}`);
  return newSlideObjectId;
}


export async function addCommentToSlide(
  token: string,
  presentationId: string,
  slideId: string,
  commentText: string
): Promise<void> {
  const url = `${SLIDES_API_URL}/${presentationId}:batchUpdate`;
  
  const requests = [
    {
      createComment: {
        objectId: slideId,
        comment: {
          text: {
            textElements: [
              {
                textRun: {
                  content: commentText,
                },
              },
            ],
          },
        },
      },
    },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Failed to add comment to slide:', errorBody);
    throw new Error('Failed to add comment to slide.');
  }

  console.log('Comment added successfully.');
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
