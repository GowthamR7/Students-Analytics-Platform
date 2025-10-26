'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Type, Image, Video, Loader2, ArrowLeft, Save } from 'lucide-react';

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
}

const categories = ['Science', 'Math', 'English', 'History', 'Geography', 'Computer Science', 'Arts', 'Other'];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Science');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { type: 'text', content: '', order: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!params.id) {
      setError('Article ID is missing');
      setFetchLoading(false);
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
      
      const article: Article = res.data.article;
      setTitle(article.title);
      setCategory(article.category);
      setContentBlocks(article.contentBlocks.length > 0 ? article.contentBlocks : [{ type: 'text', content: '', order: 0 }]);
      setError('');
    } catch (error: any) {
      console.error('Error fetching article:', error);
      setError(error.response?.data?.message || 'Failed to load article');
    } finally {
      setFetchLoading(false);
    }
  };

  const addBlock = (type: 'text' | 'image' | 'video') => {
    setContentBlocks([
      ...contentBlocks,
      { type, content: '', order: contentBlocks.length },
    ]);
  };

  const updateBlock = (index: number, content: string) => {
    const updated = [...contentBlocks];
    updated[index].content = content;
    setContentBlocks(updated);
  };

  const removeBlock = (index: number) => {
    if (contentBlocks.length === 1) return;
    const updated = contentBlocks.filter((_, i) => i !== index);
    updated.forEach((block, i) => (block.order = i));
    setContentBlocks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${params.id}`,
        { title, category, contentBlocks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push('/teacher/articles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update article');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading article...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <nav className="border-b border-slate-800 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/teacher/articles')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold gradient-text">Edit Article</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300 text-lg">
                Article Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter article title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-white text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300 text-lg">
                Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <Label className="text-gray-300 text-lg">Content Blocks</Label>

              {contentBlocks.map((block, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect p-4 rounded-lg relative"
                >
                  {contentBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <div className="mb-2 flex items-center space-x-2">
                    {block.type === 'text' && <Type className="h-5 w-5 text-purple-400" />}
                    {block.type === 'image' && <Image className="h-5 w-5 text-blue-400" />}
                    {block.type === 'video' && <Video className="h-5 w-5 text-pink-400" />}
                    <span className="text-gray-400 text-sm capitalize">{block.type} Block</span>
                  </div>

                  {block.type === 'text' ? (
                    <Textarea
                      value={block.content}
                      onChange={(e) => updateBlock(index, e.target.value)}
                      placeholder="Enter text content..."
                      className="bg-slate-900/50 border-slate-700 text-white min-h-32"
                      required
                    />
                  ) : (
                    <Input
                      type="url"
                      value={block.content}
                      onChange={(e) => updateBlock(index, e.target.value)}
                      placeholder={`Enter ${block.type} URL...`}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      required
                    />
                  )}
                </motion.div>
              ))}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => addBlock('text')}
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-900/20"
                >
                  <Type className="mr-2 h-4 w-4" />
                  Add Text
                </Button>
                <Button
                  type="button"
                  onClick={() => addBlock('image')}
                  variant="outline"
                  className="border-blue-500 text-blue-300 hover:bg-blue-900/20"
                >
                  <Image className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
                <Button
                  type="button"
                  onClick={() => addBlock('video')}
                  variant="outline"
                  className="border-pink-500 text-pink-300 hover:bg-pink-900/20"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Add Video
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Article
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/teacher/articles')}
                className="border-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
