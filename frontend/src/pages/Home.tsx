import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import { WINGS, getWingRoute } from '@/utils/constants';
import ActivityStatistics from '@/components/ActivityStatistics';
import hodphoto from '@/assets/hodphoto.jpg';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-300 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white mb-8"
          >
            <Sparkles className="w-5 h-5 text-accent-200" />
            <span className="text-sm font-medium">Empowering Innovation & Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Welcome to{' '}
            <span className="text-accent-100 drop-shadow-lg">
              Anvaya Club
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Where <strong className="text-accent-100">Will, Work, Win</strong> come together to shape the future of AI & ML
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-12 text-primary-500"
          >
            Dayananda Sagar College of Engineering
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'About',
                content: 'DSCE is a premier institution dedicated to academic excellence and holistic development of students in engineering and technology, fostering innovation and leadership.'
              },
              {
                title: 'Vision',
                content: 'To be a center of excellence in technical education, fostering innovation, research, and entrepreneurship among students to create global leaders.'
              },
              {
                title: 'Mission',
                content: 'To provide quality education, develop skilled professionals, and contribute to society through cutting-edge research and community engagement.'
              }
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full bg-white border-l-4 border-primary-500 shadow-soft hover:shadow-glow transition-all duration-300">
                  <h3 className="text-xl font-bold mb-3 text-primary-600">{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.content}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-12 text-primary-500"
          >
            Department of AI & Machine Learning
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              {[
                {
                  title: 'About',
                  content: 'The AI & ML department equips students with cutting-edge skills in artificial intelligence and machine learning, preparing them for the future of technology.'
                },
                {
                  title: 'Vision',
                  content: 'To emerge as a leading department producing competent AI/ML professionals who contribute to technological advancement and societal welfare.'
                },
                {
                  title: 'Mission',
                  content: 'To impart quality education in AI/ML, foster research culture, and develop industry-ready graduates with strong ethical values and innovative mindset.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-l-4 border-accent-400 bg-gradient-to-r from-accent-50/50 to-white shadow-soft hover:shadow-glow transition-all duration-300">
                    <h3 className="text-xl font-bold mb-3 text-accent-600">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.content}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full flex flex-col justify-center bg-white shadow-soft hover:shadow-glow transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-primary-800">HoD's Message</h3>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={hodphoto} 
                      alt="HoD" 
                      className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-primary-100"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-primary-700 leading-relaxed italic font-medium">
                      "Welcome to the Department of AI & ML. We strive to create an environment of academic excellence and innovation, nurturing the next generation of technology leaders."
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-accent-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Anvaya Club
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The heart of student innovation and collaboration in AI & ML
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'About',
                content: 'Anvaya Club is the vibrant student community fostering innovation, collaboration, and excellence through diverse activities and events.'
              },
              {
                title: 'Vision',
                content: 'To create a dynamic platform for students to explore AI/ML, develop skills, and contribute meaningfully to the tech ecosystem.'
              },
              {
                title: 'Mission',
                content: 'To organize impactful events, workshops, and activities that complement academic learning and foster holistic development.'
              }
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full bg-white border-t-4 border-accent-400 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-xl font-bold mb-3 text-primary-600">{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.content}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white via-accent-50/30 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary-500">
              Our Wings
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse wings, each dedicated to a specific domain of excellence
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WINGS.map((wing, index) => (
              <motion.div
                key={wing.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={getWingRoute(wing.slug)}>
                  <Card className="h-full group bg-gradient-to-br from-white to-primary-50 hover:from-primary-500 hover:to-accent-500 border-2 border-primary-200 hover:border-transparent shadow-soft hover:shadow-glow-lg transition-all duration-500 transform hover:-translate-y-2">
                    <h3 className="text-2xl font-bold mb-2 text-primary-600 group-hover:text-white transition-colors duration-300">
                      {wing.name}
                    </h3>
                    <p className="text-gray-600 group-hover:text-accent-50 mb-4 transition-colors duration-300">
                      {wing.description}
                    </p>
                    <div className="flex items-center text-primary-600 group-hover:text-white font-semibold transition-colors duration-300">
                      Explore <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ActivityStatistics />
    </div>
  );
};

export default Home;
