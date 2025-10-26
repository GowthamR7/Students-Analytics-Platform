'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { BookOpen, Clock, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StudentAnalytics {
  overview: {
    totalArticlesRead: number;
    totalTimeSpent: number;
  };
  timePerCategory: Array<{ category: string; time: number }>;
  recentArticles: Array<{
    articleId: {
      title: string;
      category: string;
    };
    views: number;
    timeSpent: number;
    lastViewed: string;
  }>;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'student') {
        router.push('/teacher/dashboard');
        return;
      }

      setUser(parsedUser);
      fetchAnalytics(token);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login');
    }
  }, [router]);

  const fetchAnalytics = async (token: string) => {
    try {
      console.log('📊 Fetching student analytics...');
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/analytics/student`);
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/student`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log(' Student analytics response:', res.data);
      
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error: any) {
      console.error(' Error fetching student analytics:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl mb-2">Loading your analytics...</div>
          <div className="text-gray-400">Fetching your reading data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Analytics Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setError('');
                setLoading(true);
                const token = localStorage.getItem('token');
                if (token) fetchAnalytics(token);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/student/article')}
              variant="outline"
              className="border-purple-500"
            >
              Browse Articles
            </Button>
          </div>
        </div>
      </div>
    );
  }

 
  const pieChartData = {
    labels: analytics?.timePerCategory?.map((c) => c.category) || ['No Data'],
    datasets: [
      {
        data: analytics?.timePerCategory?.map((c) => Math.round(c.time / 60)) || [1],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(20, 184, 166, 0.8)',
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(20, 184, 166, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: analytics?.recentArticles?.slice(0, 5).map((a) => 
      a.articleId.title.length > 15 ? a.articleId.title.substring(0, 15) + '...' : a.articleId.title
    ) || ['No Data'],
    datasets: [
      {
        label: 'Time Spent (mins)',
        data: analytics?.recentArticles?.slice(0, 5).map((a) => a.timeSpent) || [0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Views',
        data: analytics?.recentArticles?.slice(0, 5).map((a) => a.views) || [0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <nav className="border-b border-slate-800 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold gradient-text">Student Portal</h1>
              <div className="hidden md:flex space-x-4">
                <Link href="/student/dashboard">
                  <Button variant="ghost" className="text-purple-300">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/student/article">
                  <Button variant="ghost" className="text-gray-300">
                    Browse Articles
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{user?.name}</span>
              <Button onClick={handleLogout} variant="outline" className="border-purple-500">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name}! 
          </h2>
          <p className="text-gray-400">Here's your reading progress and analytics</p>
        </motion.div>

    
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: BookOpen,
              label: 'Articles Read',
              value: analytics?.overview?.totalArticlesRead || 0,
              color: 'from-purple-600 to-pink-600',
              suffix: ''
            },
            {
              icon: Clock,
              label: 'Total Reading Time',
              value: analytics?.overview?.totalTimeSpent || 0,
              color: 'from-blue-600 to-cyan-600',
              suffix: ' mins'
            },
            {
              icon: TrendingUp,
              label: 'Categories Explored',
              value: analytics?.timePerCategory?.length || 0,
              color: 'from-green-600 to-emerald-600',
              suffix: ''
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect p-6 rounded-xl hover:scale-105 transition-transform"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

      
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Link href="/student/article">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Articles
            </Button>
          </Link>
        </motion.div>

      
        <div className="grid md:grid-cols-2 gap-8 mb-8">
         
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-400" />
              📊 Time Spent per Category
            </h3>
            <div className="h-80 flex items-center justify-center">
              {analytics?.timePerCategory && analytics.timePerCategory.length > 0 ? (
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#e5e7eb', padding: 15 },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Start reading to see your time distribution!</p>
                </div>
              )}
            </div>
          </motion.div>

        
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
              📈 Recent Reading Activity
            </h3>
            <div className="h-80">
              {analytics?.recentArticles && analytics.recentArticles.length > 0 ? (
                <Bar data={barChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No reading activity yet!</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect p-6 rounded-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Eye className="mr-2 h-5 w-5 text-purple-400" />
            📖 Recently Read Articles
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analytics?.recentArticles && analytics.recentArticles.length > 0 ? (
              analytics.recentArticles.map((article, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold flex-1">
                      {article.articleId.title}
                    </h4>
                    <span className="text-purple-400 text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                      {article.articleId.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-blue-400 flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {article.timeSpent} mins
                      </span>
                      <span className="text-green-400 flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {article.views} views
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {new Date(article.lastViewed).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">No articles read yet</p>
                <p className="text-sm">Start exploring to see your reading history!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
