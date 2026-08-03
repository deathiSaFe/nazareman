'use client';

import { useEffect, useRef, useState } from 'react';
import { SendIcon } from '@/components/icons';

const MAX_CHARS = 1000;

const toPersianDigits = (num: number | string) => {
  return String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

export default function TopicPageClient({ topicId }: { topicId: string }) {
  const [topicData, setTopicData] = useState({
    name: 'موضوع تازه ایجاد شده',
    type: 'عمومی',
    description: 'این صفحه به‌زودی با نظرات کاربران تکمیل خواهد شد.',
  });
  
  const [comments, setComments] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusComment, setFocusComment] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('focusComment') === 'true') {
        setFocusComment(true);
      }
      
      // Read the newly created topic data from sessionStorage
      const storedDraft = sessionStorage.getItem('newTopicDraft');
      if (storedDraft) {
        try {
          const parsed = JSON.parse(storedDraft);
          setTopicData({
            name: parsed.name || topicData.name,
            type: parsed.type || topicData.type,
            description: parsed.description || 'بدون توضیحات',
          });
        } catch (e) { /* ignore parse errors */ }
      }
    }
  }, []);

  useEffect(() => {
    if (focusComment && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [focusComment]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setComment(e.target.value);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    
    // TODO:api-submit - POST to /topic/{topicId}/comments
    
    setTimeout(() => {
      // Add the new comment to the top of the list
      setComments(prev => [comment, ...prev]);
      setComment('');
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="max-w-2xl mx-auto px-5 pt-10">
        
        {/* Topic Header */}
        <header className="mb-8 animate-fade-up motion-reduce:animate-none">
          <span className="inline-block px-3 py-1 rounded-full bg-turquoise-100 text-turquoise-700 text-xs font-bold mb-3">
            {topicData.type}
          </span>
          <h1 className="font-display text-3xl text-ink-900 mb-3 leading-tight">
            {topicData.name}
          </h1>
          {topicData.description && (
            <p className="text-ink-600 leading-relaxed text-[15px]">
              {topicData.description}
            </p>
          )}
        </header>

        <div className="h-px bg-ink-900/5 mb-8" />

        {/* Comments Section */}
        <section aria-label="ثبت نظر" className="animate-fade-up motion-reduce:animate-none">
          
          {focusComment && (
            <div className="mb-6 p-5 rounded-2xl bg-saffron-50 border border-saffron-200/60 animate-pop-in motion-reduce:animate-none">
              <h2 className="font-display text-xl text-ink-900 mb-2">
                موضوع با موفقیت ثبت شد
              </h2>
              <p className="text-sm text-ink-700 leading-relaxed">
                حالا اولین نظر را برای این موضوع بنویسید. این نظر به‌عنوان نخستین مشارکت در صفحه موضوع دیده خواهد شد.
              </p>
            </div>
          )}

          {!focusComment && comments.length === 0 && (
            <h2 className="font-display text-xl text-ink-900 mb-4">نظرات</h2>
          )}
          
          {comments.length > 0 && (
             <h2 className="font-display text-xl text-ink-900 mb-4">نظرات ({toPersianDigits(comments.length)})</h2>
          )}

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-4 mb-8">
              {comments.map((c, i) => (
                <div key={i} className="p-5 bg-white rounded-3xl border border-ink-900/[0.06] shadow-sm animate-fade-up motion-reduce:animate-none">
                  <p className="text-ink-900 whitespace-pre-wrap leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          <div className="relative mb-6">
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={handleCommentChange}
              placeholder="نظر خود را بنویسید..."
              rows={5}
              className="w-full rounded-[22px] border border-ink-200 bg-white p-4 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-turquoise-500 shadow-sm transition-shadow focus:shadow-md resize-none"
              dir="rtl"
            />
            <div className={`absolute bottom-3 start-4 text-xs font-medium ${comment.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-ink-400'}`}>
              {toPersianDigits(comment.length)}/{toPersianDigits(MAX_CHARS)}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!comment.trim() || isSubmitting}
              className="bg-turquoise-600 hover:bg-turquoise-700 disabled:bg-ink-300 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-turquoise-600/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <SendIcon className="w-5 h-5" />
              {isSubmitting ? 'در حال ارسال...' : 'انتشار نظر'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}