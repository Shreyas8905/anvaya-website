import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Download, Calendar } from 'lucide-react';
import { Activity } from '@/types/activity';
import Button from './ui/Button';

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      layout
      className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-gray-900">{activity.title}</h4>
          <div className="flex items-center mt-1 text-sm text-gray-600">
            <Calendar size={16} className="mr-1" />
            {formatDate(activity.activity_date)}
          </div>
        </div>
        <div className="ml-4 text-gray-500">
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {activity.description}
              </p>

              {activity.report_url && (
                <div>
                  <a
                    href={activity.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="inline-flex items-center"
                    >
                      <Download size={16} className="mr-2" />
                      Download Report (PDF)
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActivityCard;
