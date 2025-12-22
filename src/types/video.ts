export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  latitude: number;
  longitude: number;
  description?: string;
  locationName?: string;
  authorId?: string;
  createdAt: string;
}
