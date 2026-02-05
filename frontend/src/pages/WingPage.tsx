import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Loader2 } from 'lucide-react';
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

  const slideshowPhotos = wing.photos.slice(0, 10);

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-12 sm:py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent-400 rounded-full filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-400 rounded-full filter blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center drop-shadow-lg">
              {wing.name}
            </h1>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-4 shadow-2xl border border-white/20">
              {slideshowPhotos.length > 0 ? (
                <ImageSlideshow photos={slideshowPhotos} />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary-800 to-primary-600 rounded-lg flex items-center justify-center border border-white/10">
                  <p className="text-white font-medium">No photos available</p>
                </div>
              )}
            </div>

            {wing.photos.length > 0 && (
              <div className="mt-8 text-center">
                <Link to={getWingGalleryRoute(slug!)}>
                  <Button variant="outline" className="inline-flex items-center text-white border-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-300">
                    <Image size={20} className="mr-2" />
                    View Full Gallery ({wing.photos.length} photos)
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="h-full border-t-4 border-primary-500 shadow-soft hover:shadow-glow transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-primary-600">About</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {wing.about}
              </p>
            </Card>
            <Card className="h-full border-t-4 border-accent-500 shadow-soft hover:shadow-glow transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-accent-600">Vision</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {wing.vision}
              </p>
            </Card>
            <Card className="h-full border-t-4 border-primary-500 shadow-soft hover:shadow-glow transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-primary-600">Mission</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {wing.mission}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-8 border-l-4 border-accent-500 pl-4">Activities & Events</h2>
          
          {wing.activities.length > 0 ? (
            <div className="space-y-6">
              {wing.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-primary-50 rounded-2xl border border-primary-100">
              <p className="text-primary-700 font-semibold">No activities available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WingPage;
