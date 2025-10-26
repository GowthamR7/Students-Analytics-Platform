'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Highlighter, MessageSquare, Clock, User, Plus, X, Trash2, Eye, Timer } from 'lucide-react';

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

interface Highlight {
  _id: string;
  text: string;
  note?: string;
  timestamp: string;
}

export default function StudentArticleReadingPage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showHighlightButton, setShowHighlightButton] = useState(false);
  const [highlightButtonPosition, setHighlightButtonPosition] = useState({ x: 0, y: 0 });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightMode, setHighlightMode] = useState(false);
  

  const [timeSpent, setTimeSpent] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const sessionStartRef = useRef<Date>(new Date());
  const lastActivityRef = useRef<Date>(new Date());
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeDisplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    if (!params.id || Array.isArray(params.id)) {
      setError('Invalid article ID');
      setLoading(false);
      return;
    }

    fetchArticle(token);
    fetchHighlights(token);
    startTimeTracking(token);

    return () => {
      stopTimeTracking(token);
    };
  }, [params.id, router]);

  
  useEffect(() => {
    const handleTextSelection = (event: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection) return; 
      const text = selection ? selection.toString().trim() : '';
      
      if (text && text.length > 0 && highlightMode) {
        setSelectedText(text);
        
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setHighlightButtonPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 60
        });
        setShowHighlightButton(true);
      } else {
        setShowHighlightButton(false);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [highlightMode]);


  const startTimeTracking = (token: string) => {
    console.log(' Starting time tracking session');
    sessionStartRef.current = new Date();
    lastActivityRef.current = new Date();
    setIsTracking(true);
    setTimeSpent(0);


    timeDisplayIntervalRef.current = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 1000);
      setTimeSpent(elapsed);
    }, 1000);

   
    trackingIntervalRef.current = setInterval(() => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();
      
   
      if (timeSinceLastActivity < 120000) {
        trackSession(token);
      }
    }, 30000);

   
    const updateActivity = () => {
      lastActivityRef.current = new Date();
    };

    const events = ['click', 'scroll', 'keypress', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    window.addEventListener('focus', updateActivity);
    window.addEventListener('beforeunload', () => trackFinalSession(token));
  };

  const stopTimeTracking = (token: string) => {
    console.log(' Stopping time tracking');
    setIsTracking(false);

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    if (timeDisplayIntervalRef.current) {
      clearInterval(timeDisplayIntervalRef.current);
    }

    trackFinalSession(token);
  };

  const trackSession = async (token: string) => {
    if (!article || !params.id) return;

    const now = new Date();
    const sessionDuration = Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 1000);
    
    if (sessionDuration < 5) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tracking`,
        { 
          articleId: params.id, 
          duration: sessionDuration,
          sessionStart: sessionStartRef.current.toISOString(),
          sessionEnd: now.toISOString()
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 
        }
      );
      
      console.log(`📊 Session tracked: ${sessionDuration}s`);
      sessionStartRef.current = now;
    } catch (error) {
      console.error(' Error tracking session:', error);
    }
  };

  const trackFinalSession = async (token: string) => {
    if (!article || !params.id) return;

    const now = new Date();
    const totalDuration = Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 1000);
    
    if (totalDuration < 5) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tracking`,
        { 
          articleId: params.id, 
          duration: totalDuration
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 
        }
      );
      
      console.log(` Final session tracked: ${totalDuration}s`);
    } catch (error) {
      console.error(' Error tracking final session:', error);
    }
  };

  const fetchArticle = async (token: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${params.id}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );
      
      setArticle(res.data.article);
      setError('');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Article not found');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }, 2000);
      } else {
        setError(error.response?.data?.message || 'Failed to load article');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHighlights = async (token: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/highlights?articleId=${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHighlights(res.data.highlights || []);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  };

  const handleHighlightClick = () => {
    setShowHighlightButton(false);
    setShowNoteForm(true);
  };

  const saveHighlight = async () => {
    if (!selectedText) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Authentication required. Please login again.');
      router.push('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/highlights`,
        { 
          articleId: params.id, 
          text: selectedText, 
          note: note || null 
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      console.log(' Highlight saved successfully:', response.data);
      
      setShowNoteForm(false);
      setNote('');
      setSelectedText('');
      setShowHighlightButton(false);
      
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
      
      fetchHighlights(token);
    } catch (error: any) {
      console.error(' Error saving highlight:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        router.push('/login');
      } else {
        alert(`Failed to save highlight: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const deleteHighlight = async (highlightId: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/highlights/${highlightId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchHighlights(token!);
    } catch (error) {
      console.error('Error deleting highlight:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl mb-2">Loading article...</div>
          <div className="text-gray-400 text-sm">Article ID: {params.id}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/student/article')}
              variant="outline"
              className="border-purple-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
            <Button
              onClick={() => {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('token');
                if (token) fetchArticle(token);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.push('/student/article')}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Browse Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative">
      
      <AnimatePresence>
        {showHighlightButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${highlightButtonPosition.x}px`,
              top: `${highlightButtonPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <Button
              onClick={handleHighlightClick}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg pointer-events-auto"
              size="sm"
            >
              <Highlighter className="mr-1 h-4 w-4" />
              Highlight
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

     
      <div className="fixed top-4 right-4 z-40 bg-green-500/20 border border-green-500/30 rounded-lg p-3">
        <div className="flex items-center text-green-400 text-sm">
          <Timer className="mr-2 h-4 w-4 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-semibold">{formatTime(timeSpent)}</span>
            <span className="text-xs">Reading time</span>
          </div>
        </div>
      </div>

    
      <nav className="border-b border-slate-800 glass-effect sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/article')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setHighlightMode(!highlightMode)}
                variant={highlightMode ? "default" : "outline"}
                className={highlightMode ? "bg-yellow-500 text-black" : "border-yellow-500 text-yellow-400"}
                size="sm"
              >
                <Highlighter className="mr-2 h-4 w-4" />
                {highlightMode ? 'Exit Highlight Mode' : 'Highlight Mode'}
              </Button>
              
              <div className="text-gray-400 text-sm flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                Reading Mode
              </div>
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
          <div className="flex flex-wrap items-center gap-4 mb-4">
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
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-gray-400">
            By {article.createdBy?.name} • {article.contentBlocks?.length || 0} sections
          </p>
        </motion.div>

        
        {highlightMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center text-yellow-200">
              <Highlighter className="mr-2 h-5 w-5" />
              <span className="font-semibold">Highlight Mode Active</span>
            </div>
            <p className="text-yellow-100 text-sm mt-1">
              Select any text to highlight it and add notes. A highlight button will appear above your selection.
            </p>
          </motion.div>
        )}

  
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`glass-effect rounded-xl p-8 mb-8 ${highlightMode ? 'select-text cursor-text' : ''}`}
          style={{ userSelect: highlightMode ? 'text' : 'auto' }}
        >
          {article.contentBlocks && article.contentBlocks.length > 0 ? (
            article.contentBlocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  {block.type === 'text' && (
                    <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                      {block.content}
                    </div>
                  )}
                  {block.type === 'image' && (
                    <div className="my-8">
                      <img
                        src={block.content}
                        alt={`Article image ${index + 1}`}
                        className="w-full rounded-lg shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {block.type === 'video' && (
                    <div className="my-8">
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
              ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No content available for this article.</p>
            </div>
          )}
        </motion.div>

       
        <AnimatePresence>
          {showNoteForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-effect rounded-xl p-6 mb-8 border-2 border-yellow-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Save Highlight</h3>
                </div>
                <Button
                  onClick={() => {
                    setShowNoteForm(false);
                    setNote('');
                    setSelectedText('');
                    setShowHighlightButton(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 mb-4">
                <p className="text-yellow-200 text-sm italic">
                  "{selectedText.substring(0, 200)}{selectedText.length > 200 ? '...' : ''}"
                </p>
              </div>
              
              <Textarea
                placeholder="Add a note or comment about this highlight (optional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-white mb-4"
                rows={3}
              />
              
              <div className="flex space-x-3">
                <Button
                  onClick={saveHighlight}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:from-yellow-600 hover:to-orange-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Save Highlight
                </Button>
                <Button
                  onClick={() => {
                    setShowNoteForm(false);
                    setNote('');
                    setSelectedText('');
                    setShowHighlightButton(false);
                  }}
                  variant="outline"
                  className="border-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

  
        {highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-purple-400" />
              Your Highlights ({highlights.length})
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {highlights.map((highlight) => (
                <div
                  key={highlight._id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-yellow-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-yellow-200 italic line-clamp-3 flex-1">"{highlight.text}"</p>
                    <Button
                      onClick={() => deleteHighlight(highlight._id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {highlight.note && (
                    <div className="bg-slate-800/50 p-3 rounded-md mb-2">
                      <p className="text-gray-300 text-sm">{highlight.note}</p>
                    </div>
                  )}
                  <span className="text-gray-500 text-xs flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(highlight.timestamp).toLocaleDateString()} at {new Date(highlight.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
