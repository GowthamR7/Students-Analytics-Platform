'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Eye, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Article {
  _id: string;
  title: string;
  category: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function TeacherArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'teacher') {
      router.push('/student/dashboard');
      return;
    }

    fetchMyArticles(token);
  }, []);

  useEffect(() => {
    filterArticles();
  }, [search, articles]);

  const fetchMyArticles = async (token: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles/my-articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setArticles(res.data.articles);
      setFilteredArticles(res.data.articles);
      setError('');
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      setError(error.response?.data?.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    if (search) {
      const filtered = articles.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const updated = articles.filter(article => article._id !== id);
      setArticles(updated);
      setFilteredArticles(updated.filter((a) =>
        search ? a.title.toLowerCase().includes(search.toLowerCase()) : true
      ));
    } catch (error: any) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
   
      <nav className="border-b border-slate-800 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/teacher/dashboard')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold gradient-text">My Articles</h1>
            </div>
            <Link href="/teacher/create-article">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Article
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
   
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search your articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
        </motion.div>

        
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 mb-6"
          >
            {error}
          </motion.div>
        )}

      
        {loading ? (
          <div className="text-center text-white py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading your articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
       
          <div className="text-center text-gray-400 py-20">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-4">
              {search ? 'No articles found matching your search' : 'No articles created yet'}
            </p>
            {!search && (
              <Link href="/teacher/create-article">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Create Your First Article
                </Button>
              </Link>
            )}
          </div>
        ) : (
      
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-effect rounded-xl overflow-hidden hover:border-purple-500 transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                      {article.category}
                    </span>
                    <div className="text-gray-500 text-xs">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">
                    By {article.createdBy?.name}
                  </p>

                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      onClick={() => router.push(`/teacher/preview-article/${article._id}`)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-500 text-blue-300 hover:bg-blue-900/20"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => router.push(`/teacher/edit-article/${article._id}`)}
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-300 hover:bg-green-900/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(article._id, article.title)}
                      className="border-red-500 text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

       
        {!loading && filteredArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-gray-400"
          >
            {search ? (
              <p>Found {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} matching "{search}"</p>
            ) : (
              <p>You have created {articles.length} article{articles.length !== 1 ? 's' : ''}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
