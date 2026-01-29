import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Images, Loader2 } from 'lucide-react';
import { publicApi } from '@/services/publicApi';
import { WingWithRelations } from '@/types/wing';
import ImageSlideshow from '@/components/ImageSlideshow';
import ActivityCard from '@/components/ActivityCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getWingGalleryRoute } from '@/utils/constants';

const WingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [wing, setWing] = useState<WingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWingData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await publicApi.getWingBySlug(slug);
        setWing(data);
      } catch (err) {
        setError('Failed to load wing data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWingData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !wing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Wing Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'This wing does not exist.'}</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  // Get latest 10 photos for slideshow
  const slideshowPhotos = wing.photos.slice(0, 10);

  return (
    <div className="bg-gray-50">
      {/* Hero with Slideshow */}
      <section className="bg-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 text-center">
              {wing.name}
            </h1>
            
            {slideshowPhotos.length > 0 ? (
              <ImageSlideshow photos={slideshowPhotos} />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">No photos available</p>
              </div>
            )}

            {wing.photos.length > 0 && (
              <div className="mt-6 text-center">
                <Link to={getWingGalleryRoute(slug!)}>
                  <Button variant="outline" className="inline-flex items-center">
                    <Images size={20} className="mr-2" />
                    View Full Gallery ({wing.photos.length} photos)
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* About, Vision, Mission */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">About</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {wing.about}
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Vision</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {wing.vision}
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Mission</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {wing.mission}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Activities Feed */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Activities & Events</h2>
          
          {wing.activities.length > 0 ? (
            <div className="space-y-4">
              {wing.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No activities available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WingPage;
