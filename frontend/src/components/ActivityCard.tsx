import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Download, Calendar, User } from 'lucide-react';
import { Activity } from '@/types/activity';

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

              {activity.faculty_coordinator && (
                <div className="flex items-center text-sm text-gray-600 bg-primary-50 px-3 py-2 rounded-md">
                  <User size={16} className="mr-2 text-primary-600" />
                  <span className="font-medium text-primary-700">Faculty Coordinator: </span>
                  <span className="ml-1">{activity.faculty_coordinator}</span>
                </div>
              )}

              {activity.report_url && (
                <div>
                  <a
                    href={activity.report_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-all duration-200"
                  >
                    <Download size={16} className="mr-2" />
                    Download Report
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
