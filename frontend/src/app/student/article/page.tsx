'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Clock, ArrowLeft } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  category: string;
  createdBy: { 
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function StudentArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All', 'Science', 'Math', 'English', 'History', 'Geography', 'Computer Science', 'Arts', 'Other'];

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
    } catch (err) {
      router.push('/login');
      return;
    }

    fetchArticles(token);
  }, [router]);

  useEffect(() => {
    filterArticles();
  }, [search, selectedCategory, articles]);

  const fetchArticles = async (token: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      setArticles(res.data.articles || []);
      setFilteredArticles(res.data.articles || []);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (search) {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const handleArticleClick = (articleId: string) => {
    setTimeout(() => {
      router.push(`/student/article/${articleId}`);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <nav className="border-b border-slate-800 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/student/dashboard')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold gradient-text">Browse Articles</h1>
            </div>
            
            <div className="text-gray-400 text-sm">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className={
                  selectedCategory === cat
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border-slate-700 text-gray-300 hover:bg-slate-800'
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 mb-6"
          >
            <p className="font-semibold">Error loading articles:</p>
            <p>{error}</p>
            <Button 
              onClick={() => {
                setError('');
                setLoading(true);
                const token = localStorage.getItem('token');
                if (token) fetchArticles(token);
              }}
              className="mt-2"
              size="sm"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center text-white py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">
              {articles.length === 0 ? 'No articles available' : 'No articles found'}
            </p>
            {search || selectedCategory !== 'All' ? (
              <p className="text-sm">Try adjusting your search or filters</p>
            ) : (
              <p className="text-sm">Check back later for new content</p>
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
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-effect rounded-xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer group"
                onClick={() => handleArticleClick(article._id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                      {article.category}
                    </span>
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">
                    By {article.createdBy?.name || 'Unknown'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read →
                    </span>
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
            className="mt-12 text-center text-gray-400"
          >
            {search || selectedCategory !== 'All' ? (
              <p>
                Showing {filteredArticles.length} of {articles.length} articles
                {search && ` matching "${search}"`}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </p>
            ) : (
              <p>
                {articles.length} article{articles.length !== 1 ? 's' : ''} available to read
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
