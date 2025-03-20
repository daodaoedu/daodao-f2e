export interface BusinessCardInfo {
  name: string;
  tagline: string;
  professionalAreas: string[];
  skills: string[];
  contactInfo: {
    line: string;
    linkedin: string;
    email: string;
    telegram: string;
  };
  status: {
    isActive: boolean;
    label: string;
  };
  ctaButtons: Array<{
    label: string;
    action: string;
    url: string;
  }>;
  recommendations: Array<{
    author: string;
    content: string;
    date: string;
  }>;
}

export type BusinessCardVariant = 'minimal' | 'creative' | 'business' | 'tech';
