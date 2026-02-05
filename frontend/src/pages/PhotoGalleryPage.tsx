import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { publicApi } from '@/services/publicApi';
import { Photo } from '@/types/photo';
import PhotoGallery from '@/components/PhotoGallery';
import Button from '@/components/ui/Button';
import { getWingRoute } from '@/utils/constants';

const PhotoGalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await publicApi.getWingPhotos(slug);
        setPhotos(data);
      } catch (err) {
        setError('Failed to load photos. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to={getWingRoute(slug!)}>
            <Button variant="outline" size="sm" className="inline-flex items-center mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Wing
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-600 mt-2">{photos.length} photos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <PhotoGallery photos={photos} />
      </div>
    </div>
  );
};

export default PhotoGalleryPage;
