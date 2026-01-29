import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import { WINGS, getWingRoute } from '@/utils/constants';

const Home: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Welcome to <span className="text-primary-600">Anvaya Club</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Empowering students through diverse wings and innovative activities
          </motion.p>
        </div>
      </section>

      {/* College Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">St. Joseph Engineering College</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">About</h3>
              <p className="text-gray-700 leading-relaxed">
                St. Joseph Engineering College is a premier institution dedicated to academic excellence and holistic development of students in engineering and technology.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be a center of excellence in technical education, fostering innovation, research, and entrepreneurship among students.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide quality education, develop skilled professionals, and contribute to society through cutting-edge research and community engagement.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Department Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Department of Computer Science & Engineering</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <Card>
                <h3 className="text-xl font-semibold mb-3 text-primary-600">About</h3>
                <p className="text-gray-700 leading-relaxed">
                  The CSE department equips students with strong fundamentals and practical skills in computer science, preparing them for successful careers in the tech industry.
                </p>
              </Card>
              <Card>
                <h3 className="text-xl font-semibold mb-3 text-primary-600">Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To emerge as a leading department producing competent computer science professionals who contribute to technological advancement and societal welfare.
                </p>
              </Card>
              <Card>
                <h3 className="text-xl font-semibold mb-3 text-primary-600">Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  To impart quality education in computer science, foster research culture, and develop industry-ready graduates with strong ethical values.
                </p>
              </Card>
            </div>
            <Card className="flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-4 text-primary-600">HoD's Message</h3>
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold">
                  HoD
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed italic">
                    "Welcome to the Department of CSE. We strive to create an environment of academic excellence and innovation, nurturing the next generation of technology leaders."
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Anvaya Club Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Anvaya Club</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">About</h3>
              <p className="text-gray-700 leading-relaxed">
                Anvaya Club is the vibrant student community of the CSE department, organizing diverse activities across multiple wings to enhance student learning and engagement.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To create a dynamic platform for students to explore their interests, develop skills, and contribute meaningfully to the academic and cultural ecosystem.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To organize impactful events, workshops, and activities that complement academic learning and foster holistic development of students.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Wings Overview */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Our Wings</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Explore our diverse wings, each dedicated to a specific domain of excellence
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WINGS.map((wing, index) => (
              <motion.div
                key={wing.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={getWingRoute(wing.slug)}>
                  <Card hover className="h-full">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{wing.name}</h3>
                    <p className="text-gray-600 mb-4">{wing.description}</p>
                    <div className="flex items-center text-primary-600 font-medium">
                      Explore <ArrowRight size={20} className="ml-2" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
