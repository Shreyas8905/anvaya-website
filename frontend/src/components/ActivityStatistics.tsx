import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import Card from './ui/Card';
import { publicApi, ActivityStatisticsResponse } from '@/services/publicApi';

const COLORS = [
  '#3b82f6',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];

const ActivityStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<ActivityStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    fetchStatistics(selectedYear);
  }, [selectedYear]);

  const fetchStatistics = async (year: number | null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicApi.getActivityStatistics(year === null ? undefined : year);
      setStatistics(data);
    } catch (err) {
      setError('Failed to load statistics. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error || 'Failed to load statistics'}</p>
      </div>
    );
  }

  const chartData = statistics.statistics.map((stat, index) => ({
    name: stat.wing_name,
    value: stat.activity_count,
    color: COLORS[index % COLORS.length],
  }));

  const totalActivities = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="py-16 bg-gradient-to-b from-white via-primary-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary-500">
            Activity Statistics
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Overview of activities conducted by each wing
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedYear === null
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Years
            </button>
            {statistics.available_years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedYear === year
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </motion.div>

        {totalActivities === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <Card className="inline-block bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
              <TrendingUp size={48} className="mx-auto mb-4 text-primary-400" />
              <p className="text-xl font-semibold text-primary-700">
                No activities found for {selectedYear ? selectedYear : 'the selected period'}
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full bg-white shadow-soft hover:shadow-glow transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-primary-700 text-center">
                  Activities Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full bg-white shadow-soft hover:shadow-glow transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-primary-700">
                  Activity Count by Wing
                </h3>
                <div className="space-y-4">
                  {chartData.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-white rounded-lg border border-primary-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                        <span className="font-semibold text-gray-800">{stat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary-600">
                          {stat.value}
                        </span>
                        <span className="text-sm text-gray-600">
                          {stat.value === 1 ? 'activity' : 'activities'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t-2 border-primary-200">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-accent-100 to-primary-100 rounded-lg">
                      <span className="font-bold text-lg text-gray-800">Total</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={20} className="text-accent-600" />
                        <span className="text-3xl font-bold text-accent-600">
                          {totalActivities}
                        </span>
                        <span className="text-sm text-gray-700">
                          {totalActivities === 1 ? 'activity' : 'activities'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityStatistics;
