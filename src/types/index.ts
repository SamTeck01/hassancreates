export interface Project {
  id: string;
  number: string;
  clientName: string;
  year: string;
  role: string;
  services: string[];
  description: string; // Used in Selected Works cards
  tagline: string;     // Used in Photo Viewer lightbox caption story
  href: string;
  coverImage: string;
  coverSrcSet: string;
  swiperImages: string[];
  imageCaptions: string[];
  bgImage: string;
  bgSrcSet?: string;
}

export interface Service {
  id: string;
  num: string;
  title: string;
  count: string;
  description: string;
  image1: string;
  image2: string;
}
