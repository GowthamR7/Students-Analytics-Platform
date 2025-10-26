'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Clock, User } from 'lucide-react';
import Link from 'next/link';

interface ContentBlock {
  type: 'text' | 'image' | 'video';
  content: string;
  order: number;
}

interface Article {
  _id: string;
  title: string;
  category: string;
  contentBlocks: ContentBlock[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function TeacherPreviewArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
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

    if (!params.id) {
      setError('Article ID is missing');
      setLoading(false);
      return;
    }

    fetchArticle(token);
  }, [params.id]);

  const fetchArticle = async (token: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setArticle(res.data.article);
      setError('');
    } catch (error: any) {
      console.error('Error fetching article:', error);
      if (error.response?.status === 404) {
        setError('Article not found');
      } else {
        setError(error.response?.data?.message || 'Failed to load article');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article || !confirm(`Are you sure you want to delete "${article.title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/articles/${article._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      router.push('/teacher/articles');
    } catch (error: any) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">{error || 'Article not found'}</h1>
          <Button
            onClick={() => router.push('/teacher/articles')}
            variant="outline"
            className="border-purple-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
    
      <nav className="border-b border-slate-800 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/teacher/articles')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
            
            <div className="flex items-center gap-3">
              <Link href={`/teacher/edit-article/${article._id}`}>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Article
                </Button>
              </Link>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-500 text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
     
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold">
              {article.category}
            </span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="mr-1 h-4 w-4" />
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <User className="mr-1 h-4 w-4" />
              {article.createdBy?.name}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {article.title}
          </h1>
        </motion.div>

    
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-8"
        >
          {article.contentBlocks
            .sort((a, b) => a.order - b.order)
            .map((block, index) => (
              <div key={index} className="mb-6">
                {block.type === 'text' && (
                  <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {block.content}
                  </div>
                )}
                {block.type === 'image' && (
                  <div className="my-6">
                    <img
                      src={block.content}
                      alt="Article content"
                      className="w-full rounded-lg shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/600/400';
                      }}
                    />
                  </div>
                )}
                {block.type === 'video' && (
                  <div className="my-6">
                    <video 
                      src={block.content} 
                      controls 
                      className="w-full rounded-lg shadow-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            ))}
        </motion.div>
      </div>
    </div>
  );
}
