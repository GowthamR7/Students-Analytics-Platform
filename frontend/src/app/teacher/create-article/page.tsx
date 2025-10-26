'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Type, Image, Video, Loader2, Link, Upload, ExternalLink } from 'lucide-react';

interface ContentBlock {
  type: 'text' | 'image' | 'video';
  content: string;
  order: number;
}

const categories = ['Science', 'Math', 'English', 'History', 'Geography', 'Computer Science', 'Arts', 'Other'];

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Science');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { type: 'text', content: '', order: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

 
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Article title is required');
      return false;
    }

    for (let i = 0; i < contentBlocks.length; i++) {
      const block = contentBlocks[i];
      
      if (!block.content.trim()) {
        setError(`Content block ${i + 1} cannot be empty`);
        return false;
      }

      if (block.type === 'image' || block.type === 'video') {
        if (!isValidUrl(block.content)) {
          setError(`Please enter a valid URL for ${block.type} block ${i + 1}`);
          return false;
        }

      
        if (block.type === 'image' && !block.content.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
          console.warn(`Image URL might not have a valid extension: ${block.content}`);
        }

        if (block.type === 'video' && !block.content.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i) && 
            !block.content.includes('youtube.com') && !block.content.includes('vimeo.com')) {
          console.warn(`Video URL might not be supported: ${block.content}`);
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

   
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Creating article with data:', {
        title,
        category,
        contentBlocks: contentBlocks.map(block => ({
          type: block.type,
          content: block.content.substring(0, 50) + '...',
          order: block.order
        }))
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/articles`,
        { title, category, contentBlocks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(' Article created successfully:', response.data);
      router.push('/teacher/articles');
    } catch (err: any) {
      console.error(' Article creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <nav className="border-b border-slate-800 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">Create New Article</h1>
            <Button
              variant="ghost"
              onClick={() => router.push('/teacher/articles')}
              className="text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
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
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}


            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300 text-lg">
                Article Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter an engaging article title"
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
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                
                  <div className="mb-3 flex items-center space-x-2">
                    {block.type === 'text' && <Type className="h-5 w-5 text-purple-400" />}
                    {block.type === 'image' && <Image className="h-5 w-5 text-blue-400" />}
                    {block.type === 'video' && <Video className="h-5 w-5 text-pink-400" />}
                    <span className="text-gray-400 text-sm font-semibold capitalize">
                      {block.type} Block #{index + 1}
                    </span>
                  </div>

            
                  {block.type === 'text' ? (
                    <Textarea
                      value={block.content}
                      onChange={(e) => updateBlock(index, e.target.value)}
                      placeholder="Enter your text content here... You can write multiple paragraphs."
                      className="bg-slate-900/50 border-slate-700 text-white min-h-32"
                      required
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <ExternalLink className="h-4 w-4" />
                        <span>Enter a direct URL to your {block.type}</span>
                      </div>
                      
                      <Input
                        type="url"
                        value={block.content}
                        onChange={(e) => updateBlock(index, e.target.value)}
                        placeholder={
                          block.type === 'image' 
                            ? 'https://example.com/image.jpg' 
                            : 'https://example.com/video.mp4'
                        }
                        className="bg-slate-900/50 border-slate-700 text-white"
                        required
                      />

                    
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong> Supported {block.type} URLs:</strong></p>
                        {block.type === 'image' ? (
                          <div className="space-y-1">
                            <p>• Direct image links: .jpg, .png, .gif, .webp</p>
                            <p>• Example: https://images.unsplash.com/photo-xyz.jpg</p>
                            <p>• Example: https://i.imgur.com/abc123.png</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p>• Direct video links: .mp4, .webm, .ogg</p>
                            <p>• YouTube: https://youtube.com/watch?v=...</p>
                            <p>• Vimeo: https://vimeo.com/123456789</p>
                          </div>
                        )}
                      </div>

                 
                      {block.content && (
                        <div className="flex items-center space-x-2 text-xs">
                          {isValidUrl(block.content) ? (
                            <span className="text-green-400"> Valid URL format</span>
                          ) : (
                            <span className="text-red-400"> Invalid URL format</span>
                          )}
                        </div>
                      )}
                    </div>
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
                  Add Text Block
                </Button>
                <Button
                  type="button"
                  onClick={() => addBlock('image')}
                  variant="outline"
                  className="border-blue-500 text-blue-300 hover:bg-blue-900/20"
                >
                  <Image className="mr-2 h-4 w-4" />
                  Add Image URL
                </Button>
                <Button
                  type="button"
                  onClick={() => addBlock('video')}
                  variant="outline"
                  className="border-pink-500 text-pink-300 hover:bg-pink-900/20"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Add Video URL
                </Button>
              </div>

           
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-200 text-sm">
                <h4 className="font-semibold mb-2"> How to add images and videos:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>For images:</strong> Use direct image URLs (ending in .jpg, .png, etc.)</li>
                  <li><strong>For videos:</strong> Use direct video URLs or YouTube/Vimeo links</li>
                  <li><strong>Free image sources:</strong> Unsplash, Pixabay, Pexels</li>
                  <li><strong>Free video hosting:</strong> YouTube, Vimeo, or direct MP4 links</li>
                </ul>
              </div>
            </div>

        
            <div className="flex items-center space-x-4 pt-6 border-t border-slate-700">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Article...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Article
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/teacher/articles')}
                className="border-slate-700 px-6 py-3"
                disabled={loading}
              >
                Cancel
              </Button>

      
              <div className="text-gray-400 text-sm ml-auto">
                {contentBlocks.length} block{contentBlocks.length !== 1 ? 's' : ''} added
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
