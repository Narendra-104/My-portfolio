export type NavSection = 'home' | 'about' | 'projects' | 'experience' | 'resume' | 'certificates' | 'contact';

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  link?: string;
  github?: string;
  metrics?: { label: string; value: string }[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  bullets: string[];
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  cgpa: string;
  period: string;
  honors: string[];
  details: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  certId: string;
  image: string;
  verifyUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  timestamp: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  statusTag: string;
  avatarImage: string;
  fallbackImage?: string;
}
export interface AIAssistant {
  name: string;
  role: string;
  status: 'online' | 'idle' | 'offline';
  capabilities: string[];
}
