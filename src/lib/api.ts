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
