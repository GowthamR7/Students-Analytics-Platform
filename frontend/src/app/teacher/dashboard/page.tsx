'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { BookOpen, Users, Eye, Plus, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Analytics {
  overview: {
    totalArticles: number;
    totalViews: number;
    totalStudents: number;
  };
  articlesVsViews: Array<{ title: string; views: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  mostViewedCategories: Array<{ category: string; views: number }>;
  top3Categories: Array<{ category: string; views: number }>;
  studentWiseProgress: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    totalArticlesRead: number;
    totalViews: number;
    totalTimeSpent: number;
    lastActivity: string;
  }>;
  dailyEngagement: Array<{ date: string; views: number }>;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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
      if (parsedUser.role !== 'teacher') {
        router.push('/student/dashboard');
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
      console.log('📊 Fetching teacher analytics...');
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/analytics`);
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log(' Analytics response:', res.data);
      
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error: any) {
      console.error(' Error fetching analytics:', error);
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
          <div className="text-white text-xl mb-2">Loading analytics...</div>
          <div className="text-gray-400">Fetching your teaching data</div>
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
              onClick={() => router.push('/teacher/articles')}
              variant="outline"
              className="border-purple-500"
            >
              Go to Articles
            </Button>
          </div>
        </div>
      </div>
    );
  }

 
  const barChartData = {
    labels: analytics?.articlesVsViews?.slice(0, 5).map((a) => 
      a.title.length > 20 ? a.title.substring(0, 20) + '...' : a.title
    ) || ['No Data'],
    datasets: [
      {
        label: 'Views',
        data: analytics?.articlesVsViews?.slice(0, 5).map((a) => a.views) || [0],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const pieChartData = {
    labels: analytics?.categoryDistribution?.map((c) => c.category) || ['No Data'],
    datasets: [
      {
        data: analytics?.categoryDistribution?.map((c) => c.count) || [1],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const mostViewedCategoriesData = {
    labels: analytics?.mostViewedCategories?.map((c) => c.category) || ['No Data'],
    datasets: [
      {
        label: 'Views',
        data: analytics?.mostViewedCategories?.map((c) => c.views) || [0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const top3CategoriesData = {
    labels: analytics?.top3Categories?.map((c) => c.category) || ['No Data'],
    datasets: [
      {
        data: analytics?.top3Categories?.map((c) => c.views) || [1],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 3,
      },
    ],
  };

  const lineChartData = {
    labels: analytics?.dailyEngagement?.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || ['No Data'],
    datasets: [
      {
        label: 'Daily Views',
        data: analytics?.dailyEngagement?.map((d) => d.views) || [0],
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
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
              <h1 className="text-2xl font-bold gradient-text">Teacher Portal</h1>
              <div className="hidden md:flex space-x-4">
                <Link href="/teacher/dashboard">
                  <Button variant="ghost" className="text-purple-300">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/teacher/articles">
                  <Button variant="ghost" className="text-gray-300">
                    My Articles
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
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}! </h2>
          <p className="text-gray-400">Here's your complete teaching analytics overview</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: BookOpen,
              label: 'Articles Created',
              value: analytics?.overview?.totalArticles || 0,
              color: 'from-purple-600 to-pink-600',
            },
            {
              icon: Eye,
              label: 'Total Views',
              value: analytics?.overview?.totalViews || 0,
              color: 'from-blue-600 to-cyan-600',
            },
            {
              icon: Users,
              label: 'Students Engaged',
              value: analytics?.overview?.totalStudents || 0,
              color: 'from-green-600 to-emerald-600',
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
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Create Article Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Link href="/teacher/create-article">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Article
            </Button>
          </Link>
        </motion.div>

        {/* Top 3 Categories */}
        {analytics?.top3Categories && analytics.top3Categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-effect p-6 rounded-xl mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-yellow-400" />
              🏆 Top 3 Most-Viewed Categories
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {analytics.top3Categories.map((category, index) => (
                <div
                  key={category.category}
                  className="bg-slate-900/50 p-4 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-semibold">#{index + 1}</span>
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">{category.category}</h4>
                  <p className="text-purple-400 text-sm">{category.views} views</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

       
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">📊 Total Views per Article</h3>
            <div className="h-80">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">🔥 Most-Viewed Categories</h3>
            <div className="h-80">
              <Bar data={mostViewedCategoriesData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">📈 Category Distribution</h3>
            <div className="h-80 flex items-center justify-center">
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">🎯 Top 3 Categories Views</h3>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={top3CategoriesData}
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
            </div>
          </motion.div>
        </div>

    
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect p-6 rounded-xl mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">📅 Daily Engagement Trends</h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </motion.div>

       
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-effect p-6 rounded-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-400" />
            Student-wise Article Reading Progress
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-gray-300">Student</th>
                  <th className="text-left p-3 text-gray-300">Articles Read</th>
                  <th className="text-left p-3 text-gray-300">Total Views</th>
                  <th className="text-left p-3 text-gray-300">Time (mins)</th>
                  <th className="text-left p-3 text-gray-300">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.studentWiseProgress && analytics.studentWiseProgress.length > 0 ? (
                  analytics.studentWiseProgress.slice(0, 10).map((student, index) => (
                    <tr key={student.studentId} className="border-b border-slate-800 hover:bg-slate-900/30">
                      <td className="p-3">
                        <div>
                          <div className="text-white font-semibold">{student.studentName}</div>
                          <div className="text-gray-500 text-xs">{student.studentEmail}</div>
                        </div>
                      </td>
                      <td className="p-3 text-purple-400 font-bold">{student.totalArticlesRead}</td>
                      <td className="p-3 text-blue-400 font-bold">{student.totalViews}</td>
                      <td className="p-3 text-green-400 font-bold flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {student.totalTimeSpent}
                      </td>
                      <td className="p-3 text-gray-400 text-xs">
                        {new Date(student.lastActivity).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No student engagement data yet. Students will appear here once they start reading your articles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
