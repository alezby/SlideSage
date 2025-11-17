import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    // Fallback in case image is not found
    return {
      id: 'fallback',
      description: 'fallback',
      imageUrl: 'https://picsum.photos/seed/fallback/1280/720',
      imageHint: 'abstract',
    };
  }
  return image;
};

export type Slide = {
  id: string;
  title: string;
  content: string;
  image: ImagePlaceholder;
};

export type Presentation = {
  id: string;
  title: string;
  slides: Slide[];
  thumbnailUrl?: string;
};

export const presentations: Presentation[] = [
  {
    id: 'pres1',
    title: 'Q2 Marketing Strategy',
    slides: [
      {
        id: 's1-1',
        title: 'Q2 Marketing Strategy',
        content: 'Our plan for the next quarter.',
        image: getImage('slide1'),
      },
      {
        id: 's1-2',
        title: 'Market Growth',
        content: 'We are seeing an upward trend in market engagement.',
        image: getImage('slide2'),
      },
      {
        id: 's1-3',
        title: 'Our Team',
        content: 'The people making it happen.',
        image: getImage('slide3'),
      },
      {
        id: 's1-4',
        title: 'New Features',
        content: 'Launching three new exciting features.',
        image: getImage('slide4'),
      },
      {
        id: 's1-5',
        title: 'Get In Touch',
        content: 'Contact us for more information.',
        image: getImage('slide5'),
      },
    ],
  },
  {
    id: 'pres2',
    title: 'Project Phoenix - Q1 Review',
    slides: [
      {
        id: 's2-1',
        title: 'Q1 Financials',
        content: 'Review of our first quarter performance.',
        image: getImage('slide6'),
      },
      {
        id: 's2-2',
        title: 'Budget Allocation',
        content: 'How we spent our budget.',
        image: getImage('slide7'),
      },
      {
        id: 's2-3',
        title: 'Project Timeline',
        content: 'Roadmap and milestones for Project Phoenix.',
        image: getImage('slide8'),
      },
    ],
  },
  {
    id: 'pres3',
    title: 'Company Expansion Plan',
    slides: [
      {
        id: 's3-1',
        title: 'New Office Location',
        content: 'Opening a new branch in the city.',
        image: getImage('slide9'),
      },
      {
        id: 's3-2',
        title: 'Thank You',
        content: 'Questions and answers session.',
        image: getImage('slide10'),
      },
    ],
  },
];
