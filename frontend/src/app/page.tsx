'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ThreeBackground from '@/components/three/ThreeBackground';
import { BookOpen, BarChart3, Users, Sparkles } from 'lucide-react';

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Hero Section */}
      <div className="relative z-10">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold gradient-text">EduAnalytics</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-purple-400">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20">
          <div ref={heroRef} className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <span className="px-4 py-2 rounded-full glass-effect text-purple-300 text-sm font-semibold">
                ✨ Transform Education with Analytics
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="gradient-text">Smart Learning</span>
              <br />
              <span className="text-white">Analytics Platform</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Empower teachers to create engaging content and track student progress with
              interactive charts and real-time analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/register?role=teacher">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
                >
                  I'm a Teacher
                </Button>
              </Link>
              <Link href="/register?role=student">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-900/20 text-lg px-8 py-6"
                >
                  I'm a Student
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: 'Rich Content Creation',
                description: 'Create articles with text, images, videos, and 3D objects',
              },
              {
                icon: BarChart3,
                title: 'Interactive Analytics',
                description: 'Beautiful charts showing engagement and reading patterns',
              },
              {
                icon: Users,
                title: 'Student Engagement',
                description: 'Track highlights, notes, and time spent on each article',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="glass-effect p-8 rounded-2xl hover:border-purple-500 transition-all duration-300"
              >
                <feature.icon className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}