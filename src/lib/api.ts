import { supabase } from './supabase';
import { Video } from '@/types/video';

export async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', JSON.stringify(error, null, 2));
    if (error.code === '42P01') { // undefined_table
      console.error('Hint: Has the "videos" table been created in Supabase? Check supabase_schema.sql.');
    }
    return []; // Return empty array on error for now, or throw
  }

  // Map database snake_case to application camelCase
  return (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    youtubeId: item.youtube_id,
    latitude: item.latitude,
    longitude: item.longitude,
    description: item.description,
    locationName: item.location_name,
    authorId: item.author_id,
    createdAt: item.created_at,
  }));
}

export interface AddVideoInput {
  title: string;
  youtubeId: string;
  latitude: number;
  longitude: number;
  description?: string;
  locationName?: string;
}

export async function addVideo(input: AddVideoInput): Promise<Video> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('사용자 인증이 필요합니다.');
  }

  const { data, error } = await supabase
    .from('videos')
    .insert([
      {
        title: input.title,
        youtube_id: input.youtubeId,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description || null,
        location_name: input.locationName || null,
        author_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding video:', error);
    throw error;
  }

  // Map to camelCase
  return {
    id: data.id,
    title: data.title,
    youtubeId: data.youtube_id,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    locationName: data.location_name,
    authorId: data.author_id,
    createdAt: data.created_at,
  };
}
