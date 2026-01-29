import { Activity } from './activity';
import { Photo } from './photo';

export interface Wing {
  id: number;
  name: string;
  slug: string;
  about: string;
  vision: string;
  mission: string;
}

export interface WingWithRelations extends Wing {
  activities: Activity[];
  photos: Photo[];
}
