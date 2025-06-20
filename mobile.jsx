import React, { useState, useRef } from 'react';
import { 
  X, 
  Image, 
  Hash,
  Lightbulb,
  User,
  FileText,
  Video,
  BookOpen,
  Globe,
  Link,
  Shell,
  MessageCircle,
  Share2,
  ArrowLeft,
  Edit,
  Trash2,
  Bookmark,
  ArrowUp,
  Plus
} from 'lucide-react';

const MobileIdeaSharingInterface = () => {
  const [ideaContent, setIdeaContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [resources, setResources] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showResourceInput, setShowResourceInput] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [publishedData, setPublishedData] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showPostList, setShowPostList] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editResourceName, setEditResourceName] = useState('');
  const [editResourceUrl, setEditResourceUrl] = useState('');
  const [showCommentOptionsMenu, setShowCommentOptionsMenu] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [showPostOptionsMenu, setShowPostOptionsMenu] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const [allPosts, setAllPosts] = useState([
    {
      id: 1,
      author: '陳雅萍',
      role: 'UI設計師',
      content: '最近在研究設計系統的建立，發現一致性比創意更重要。團隊協作時，標準化的組件庫能大幅提升效率。',
      tags: [
        { id: 1, name: 'UI設計', category: 'design' },
        { id: 2, name: '設計系統', category: 'design' }
      ],
      resources: [],
      likes: 12,
      comments: 3,
      date: '30/05/2025'
    },
    {
      id: 2,
      author: '王建文',
      role: '前端工程師',
      content: '學習React Hook的過程中，useEffect的依賴陣列管理是最容易出錯的地方。建議新手先熟悉基本概念再進階。',
      tags: [
        { id: 3, name: 'React', category: 'tech' },
        { id: 4, name: '前端開發', category: 'tech' }
      ],
      resources: [
        { id: 1, title: 'React Hook 完整指南', url: 'https://react.dev/hooks', type: 'article' }
      ],
      likes: 8,
      comments: 5,
      date: '29/05/2025'
    }
  ]);

  const [comments, setComments] = useState([
    {
      id: 1,
      author: '李美玲',
      role: '產品設計師',
      content: '很有用的分享！我在設計流程中也遇到類似的挑戰',
      time: '5分鐘前'
    },
    {
      id: 2,
      author: '張建華',
      role: '前端工程師',
      content: '感謝分享這個觀點，對我的項目很有啟發',
      time: '10分鐘前'
    }
  ]);

  const fileInputRef = useRef(null);

  const suggestedTags = [
    { id: 1, name: 'UX設計', category: 'design', count: 234 },
    { id: 2, name: '程式設計', category: 'tech', count: 456 },
    { id: 3, name: '資料科學', category: 'tech', count: 189 },
    { id: 4, name: '產品管理', category: 'business', count: 167 },
    { id: 5, name: '心理學', category: 'psychology', count: 123 },
    { id: 6, name: '行為科學', category: 'psychology', count: 98 },
    { id: 7, name: '學習科學', category: 'education', count: 87 },
    { id: 8, name: '創新思維', category: 'creativity', count: 145 }
  ];

  const handleTagClick = (tag) => {
    if (!selectedTags.find(t => t.id === tag.id) && selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
    setShowTagSuggestions(false);
  };

  const createCustomTag = () => {
    if (customTagInput.trim() && !selectedTags.find(t => t.name.toLowerCase() === customTagInput.trim().toLowerCase()) && selectedTags.length < 3) {
      const newTag = {
        id: Date.now(),
        name: customTagInput.trim(),
        category: 'custom',
        count: 1
      };
      setSelectedTags([...selectedTags, newTag]);
      setCustomTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleCustomTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createCustomTag();
    }
  };

  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const addNewResource = () => {
    setUrlError('');
    
    if (newResourceName.trim() && newResourceUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(newResourceUrl.trim())) {
        setUrlError('請輸入有效的網址格式，例如：https://example.com');
        return;
      }
      
      const newResource = {
        id: Date.now(),
        title: newResourceName.trim(),
        url: newResourceUrl.trim(),
        type: 'custom'
      };
      setResources([...resources, newResource]);
      setNewResourceName('');
      setNewResourceUrl('');
      setShowResourceInput(false);
      setUrlError('');
    }
  };

  const removeResource = (resourceId) => {
    setResources(resources.filter(r => r.id !== resourceId));
  };

  const handlePublish = () => {
    const newPost = {
      id: Date.now(),
      author: '林小明',
      role: 'UX設計師',
      content: ideaContent,
      tags: selectedTags,
      resources: resources,
      likes: 0,
      comments: 0,
      date: formatDate(new Date())
    };
    
    setAllPosts([newPost, ...allPosts]);
    setPublishedData({
      content: ideaContent,
      tags: selectedTags,
      resources: resources,
      timestamp: new Date()
    });
    setIsPublished(true);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleEditPost = () => {
    setIsEditingPost(true);
    setEditedContent(publishedData?.content || '');
    setShowOptionsMenu(false);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      setPublishedData({
        ...publishedData,
        content: editedContent.trim()
      });
      setIsEditingPost(false);
      setEditedContent('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPost(false);
    setEditedContent('');
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: '林小明',
        role: 'UX設計師',
        content: newComment.trim(),
        time: '剛剛'
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleCommentKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleBackToForm = () => {
    setIsPublished(false);
    setShowPostList(true);
    setIdeaContent('');
    setSelectedTags([]);
    setResources([]);
    setPublishedData(null);
    setShowComments(false);
    setNewComment('');
    setShowCommentOptionsMenu(null);
    setShowDeleteConfirmation(null);
    setShowPostOptionsMenu(null);
    setIsEditingPost(false);
    setEditedContent('');
  };

  const handleBackToCreation = () => {
    setShowPostList(false);
    setIsPublished(false);
    setShowPostOptionsMenu(null);
  };

  const getTagCategoryColor = (category) => {
    const colors = {
      design: 'bg-purple-100 text-purple-700 border-purple-200',
      tech: 'bg-blue-100 text-blue-700 border-blue-200',
      business: 'bg-green-100 text-green-700 border-green-200',
      psychology: 'bg-pink-100 text-pink-700 border-pink-200',
      education: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      creativity: 'bg-orange-100 text-orange-700 border-orange-200',
      custom: 'bg-cyan-100 text-cyan-700 border-cyan-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getResourceIcon = (type) => {
    const icons = {
      article: <FileText size={18} />,
      course: <Video size={18} />,
      book: <BookOpen size={18} />,
      website: <Globe size={18} />
    };
    return icons[type] || <Link size={18} />;
  };

  if (showPostList) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          {/* Mobile Header */}
          <div style={{ background: 'linear-gradient(to right, #16b9b3, #0f3036)' }} className="px-4 py-3 flex items-center justify-between safe-area-top">
            <div className="flex items-center">
              <button 
                onClick={handleBackToCreation}
                className="text-white mr-3 p-2 -ml-2 active:bg-white active:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-white text-lg font-medium">想法</h1>
            </div>
            <button 
              onClick={handleBackToCreation}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg active:bg-opacity-30 transition-colors text-sm font-medium"
            >
              分享新想法
            </button>
          </div>

          {/* Mobile Post List */}
          <div className="px-4 py-3 space-y-4">
            {allPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden active:bg-gray-50 transition-colors">
                {/* Post Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-base" style={{ color: '#0f3036' }}>
                          {post.author}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.role}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile top-right metadata */}
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 text-white" style={{ backgroundColor: '#ffa10b' }}>
                          想法
                        </span>
                        <button
                          className="text-gray-400 p-2 -mr-2 active:bg-gray-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPostOptionsMenu(showPostOptionsMenu === post.id ? null : post.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                          </svg>
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                  </div>
                  
                  {/* Options Menu */}
                  {showPostOptionsMenu === post.id && (
                    <div className="mb-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <button 
                          className="w-full flex items-center px-3 py-3 text-sm text-gray-700 active:bg-gray-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPostOptionsMenu(null);
                          }}
                        >
                          <Bookmark size={16} className="mr-3" />
                          儲存
                        </button>
                        <button 
                          className="w-full flex items-center px-3 py-3 text-sm text-red-600 active:bg-red-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPostOptionsMenu(null);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                            <line x1="4" y1="22" x2="4" y2="15"/>
                          </svg>
                          檢舉
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Post Content */}
                  <div className="mb-3">
                    <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#0f3036' }}>
                      {post.content}
                    </p>
                  </div>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Resources */}
                  {post.resources && post.resources.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {post.resources.map(resource => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg active:bg-opacity-80 transition-colors cursor-pointer"
                          style={{ backgroundColor: '#99ecff30' }}
                        >
                          <div className="mr-3" style={{ color: '#16b9b3' }}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <span className="text-sm" style={{ color: '#0f3036' }}>{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Mobile Action Bar */}
                <div className="border-t border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-around">
                    <button className="flex items-center space-x-2 px-3 py-2 active:bg-gray-100 rounded-lg transition-colors">
                      <Shell size={20} style={{ color: '#16b9b3' }} />
                      <span className="text-sm font-medium text-gray-700">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 active:bg-gray-100 rounded-lg transition-colors">
                      <MessageCircle size={20} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 active:bg-gray-100 rounded-lg transition-colors">
                      <Share2 size={20} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">分享</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isPublished) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          {/* Mobile Header */}
          <div style={{ background: 'linear-gradient(to right, #16b9b3, #0f3036)' }} className="px-4 py-3 flex items-center safe-area-top">
            <button 
              onClick={handleBackToForm}
              className="text-white mr-3 p-2 -ml-2 active:bg-white active:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          {/* Mobile Post Detail */}
          <div className="p-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Post Header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center flex-1">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 text-white font-medium" style={{ backgroundColor: '#16b9b3' }}>
                      林
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-base" style={{ color: '#0f3036' }}>林小明</div>
                      <div className="text-sm text-gray-500">UX設計師 | 產品經理</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 text-white" style={{ backgroundColor: '#ffa10b' }}>
                        想法
                      </span>
                      <button
                        onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                        className="text-gray-400 p-2 -mr-2 active:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(new Date())}</span>
                  </div>
                </div>
                
                {/* Options Menu */}
                {showOptionsMenu && (
                  <div className="mb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <button 
                        className="w-full flex items-center px-3 py-3 text-sm text-gray-700 active:bg-gray-100 rounded-lg transition-colors"
                        onClick={handleEditPost}
                      >
                        <Edit size={16} className="mr-3" />
                        編輯
                      </button>
                      <button className="w-full flex items-center px-3 py-3 text-sm text-gray-700 active:bg-gray-100 rounded-lg transition-colors">
                        <Bookmark size={16} className="mr-3" />
                        儲存
                      </button>
                      <button 
                        className="w-full flex items-center px-3 py-3 text-sm text-red-600 active:bg-red-50 rounded-lg transition-colors"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setShowDeleteConfirmation('idea-post');
                        }}
                      >
                        <Trash2 size={16} className="mr-3" />
                        刪除
                      </button>
                      <button className="w-full flex items-center px-3 py-3 text-sm text-red-600 active:bg-red-50 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                          <line x1="4" y1="22" x2="4" y2="15"/>
                        </svg>
                        檢舉
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="mb-4">
                  {isEditingPost ? (
                    <div className="space-y-4">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base resize-none focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 whitespace-pre-wrap"
                        rows="6"
                        maxLength={200}
                      />
                      <div className="text-sm text-gray-400 text-right">
                        {editedContent.length}/200
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 py-3 text-base text-gray-700 bg-gray-200 rounded-lg active:bg-gray-300 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editedContent.trim()}
                          className="flex-1 py-3 text-base text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          style={{ backgroundColor: editedContent.trim() ? '#16b9b3' : '#d1d5db' }}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#0f3036' }}>
                      {publishedData?.content}
                    </p>
                  )}
                </div>
                
                {/* Tags */}
                {!isEditingPost && publishedData?.tags && publishedData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {publishedData.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Resources */}
                {!isEditingPost && publishedData?.resources && publishedData.resources.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {publishedData.resources.map(resource => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 rounded-lg active:bg-opacity-80 transition-colors cursor-pointer"
                        style={{ backgroundColor: '#99ecff30' }}
                      >
                        <div className="mr-3" style={{ color: '#16b9b3' }}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <span className="text-sm" style={{ color: '#0f3036' }}>{resource.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mobile Action Bar */}
              {!isEditingPost && (
                <div className="border-t border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-around">
                    <button className="flex items-center space-x-2 px-3 py-2 active:bg-gray-100 rounded-lg transition-colors">
                      <Shell size={20} style={{ color: '#16b9b3' }} />
                      <span className="text-sm font-medium text-gray-700">3</span>
                    </button>
                    <button 
                      onClick={() => setShowComments(!showComments)}
                      className="flex items-center space-x-2 px-3 py-2 active:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MessageCircle size={20} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{comments.length}</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 active:bg-gray-100 rounded-lg transition-colors">
                      <Share2 size={20} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">分享</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Comments */}
            {!isEditingPost && showComments && (
              <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium text-base mb-4" style={{ color: '#0f3036' }}>
                    評論 ({comments.length})
                  </h3>
                  
                  {/* Add Comment */}
                  <div className="mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#16b9b3' }}>
                        林
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={handleCommentKeyPress}
                          placeholder="也分享你的想法..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base resize-none transition-all duration-200 whitespace-pre-wrap"
                          rows="3"
                        />
                        <div className="flex justify-end items-center mt-3">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="p-3 rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: newComment.trim() ? '#16b9b3' : '#d1d5db'
                            }}
                            aria-label="發送評論"
                          >
                            <ArrowUp size={20} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex items-start space-x-3 relative">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                          {comment.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm" style={{ color: '#0f3036' }}>
                                {comment.author}
                              </span>
                              <button
                                className="text-gray-400 p-1 active:bg-gray-200 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCommentOptionsMenu(showCommentOptionsMenu === comment.id ? null : comment.id);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1"/>
                                  <circle cx="12" cy="5" r="1"/>
                                  <circle cx="12" cy="19" r="1"/>
                                </svg>
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {comment.role} • {comment.time}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                          
                          {/* Comment Options */}
                          {showCommentOptionsMenu === comment.id && (
                            <div className="mt-2">
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                                <button 
                                  className="w-full flex items-center px-3 py-3 text-sm text-gray-700 active:bg-gray-100 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCommentOptionsMenu(null);
                                  }}
                                >
                                  <Edit size={16} className="mr-3" />
                                  編輯
                                </button>
                                <button 
                                  className="w-full flex items-center px-3 py-3 text-sm text-red-600 active:bg-red-50 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCommentOptionsMenu(null);
                                    setShowDeleteConfirmation(comment.id);
                                  }}
                                >
                                  <Trash2 size={16} className="mr-3" />
                                  刪除
                                </button>
                                <button 
                                  className="w-full flex items-center px-3 py-3 text-sm text-red-600 active:bg-red-50 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCommentOptionsMenu(null);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                                    <line x1="4" y1="22" x2="4" y2="15"/>
                                  </svg>
                                  檢舉
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">確定刪除?</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirmation(null)}
                    className="flex-1 py-3 text-base font-medium text-gray-700 bg-gray-200 rounded-lg active:bg-gray-300 transition-colors"
                  >
                    否
                  </button>
                  <button
                    onClick={() => {
                      if (showDeleteConfirmation === 'idea-post') {
                        setShowDeleteConfirmation(null);
                        setShowOptionsMenu(false);
                      } else {
                        setComments(comments.filter(c => c.id !== showDeleteConfirmation));
                        setShowDeleteConfirmation(null);
                      }
                    }}
                    className="flex-1 py-3 text-base font-medium text-white bg-red-600 rounded-lg active:bg-red-700 transition-colors"
                  >
                    是
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        {/* Mobile Header */}
        <div style={{ background: 'linear-gradient(to right, #16b9b3, #0f3036)' }} className="px-4 py-3 flex items-center justify-between safe-area-top">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center border border-white border-opacity-30 text-white font-medium">
              林
            </div>
            
            <div className="ml-3">
              <div className="text-white font-medium text-base">林小明</div>
              <div className="text-white text-sm opacity-80">
                UX設計師 | 產品經理
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowPostList(true)}
            className="text-white p-2 -mr-2 active:bg-white active:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Create Form */}
        <div className="p-4">
          {/* Content Input */}
          <div className="mb-6">
            <textarea
              value={ideaContent}
              onChange={(e) => setIdeaContent(e.target.value)}
              placeholder="分享你的學習洞察、重要發現或創新想法..."
              className="w-full px-4 py-4 border border-gray-200 rounded-lg text-base resize-none focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 whitespace-pre-wrap"
              rows="6"
              maxLength={200}
            />
            <div className="text-sm text-gray-400 mt-2 text-right">
              {ideaContent.length}/200
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center py-3 text-gray-600 border border-gray-200 rounded-lg active:bg-gray-50 transition-colors"
            >
              <Image size={20} className="mr-2" />
              <span className="text-base">圖片</span>
            </button>
            
            <button
              onClick={() => setShowTagSuggestions(!showTagSuggestions)}
              className="flex-1 flex items-center justify-center py-3 text-gray-600 border border-gray-200 rounded-lg active:bg-gray-50 transition-colors"
            >
              <Hash size={20} className="mr-2" />
              <span className="text-base">標籤</span>
            </button>

            <button
              onClick={() => setShowResourceInput(!showResourceInput)}
              className="flex-1 flex items-center justify-center py-3 text-gray-600 border border-gray-200 rounded-lg active:bg-gray-50 transition-colors"
            >
              <Link size={20} className="mr-2" />
              <span className="text-base">資源</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm border transition-colors ${
                      tag.category === 'custom' 
                        ? 'border-cyan-200 text-cyan-700 bg-cyan-100'
                        : getTagCategoryColor(tag.category)
                    }`}
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-2 p-1 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tag Suggestions */}
          {showTagSuggestions && (
            <div className="mb-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-base mb-3">添加標籤</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyPress={handleCustomTagKeyPress}
                      placeholder="輸入新標籤名稱"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-base transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                    <button
                      onClick={createCustomTag}
                      disabled={!customTagInput.trim() || selectedTags.length >= 3}
                      className="px-4 py-3 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base font-medium"
                      style={{ backgroundColor: '#16b9b3' }}
                    >
                      新增
                    </button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-sm text-gray-500 mb-2 px-2">熱門標籤</div>
                    {suggestedTags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag)}
                        className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors active:bg-gray-100"
                        disabled={selectedTags.find(t => t.id === tag.id) || selectedTags.length >= 3}
                      >
                        <span className={`text-base ${selectedTags.find(t => t.id === tag.id) || selectedTags.length >= 3 ? 'text-gray-400' : 'text-gray-700'}`}>
                          {tag.name}
                        </span>
                        <span className="text-sm text-gray-400">{tag.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resources */}
          {resources.length > 0 && (
            <div className="mb-6">
              <div className="space-y-3">
                {resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex items-center flex-1">
                      <div className="mr-3" style={{ color: '#16b9b3' }}>
                        {getResourceIcon(resource.type)}
                      </div>
                      <span className="text-base" style={{ color: '#0f3036' }}>{resource.title}</span>
                    </div>
                    <button
                      onClick={() => removeResource(resource.id)}
                      className="text-gray-400 p-2 active:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resource Input */}
          {showResourceInput && (
            <div className="mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-base mb-4">添加資源</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0f3036' }}>
                      資源名稱
                    </label>
                    <input
                      type="text"
                      value={newResourceName}
                      onChange={(e) => setNewResourceName(e.target.value)}
                      placeholder="例如：設計思考入門指南"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0f3036' }}>
                      資源連結
                    </label>
                    <input
                      type="url"
                      value={newResourceUrl}
                      onChange={(e) => {
                        setNewResourceUrl(e.target.value);
                        setUrlError('');
                      }}
                      placeholder="https://example.com"
                      className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 ${
                        urlError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-teal-500 focus:ring-teal-200'
                      }`}
                    />
                    {urlError && (
                      <p className="text-sm text-red-500 mt-2">{urlError}</p>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowResourceInput(false);
                        setNewResourceName('');
                        setNewResourceUrl('');
                        setUrlError('');
                      }}
                      className="flex-1 py-3 text-base text-gray-700 bg-gray-200 rounded-lg active:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={addNewResource}
                      disabled={!newResourceName.trim() || !newResourceUrl.trim()}
                      className="flex-1 py-3 text-base text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      style={{ backgroundColor: '#16b9b3' }}
                    >
                      新增
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Impact Preview */}
          {selectedTags.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Lightbulb size={20} className="mr-3" style={{ color: '#0f3036' }} />
                <span 
                  className="text-sm font-medium"
                  style={{ 
                    background: 'linear-gradient(135deg, #16b9b3, #0f3036)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  根據你的標籤，這個想法可能會幫助到 <strong>15-20 位</strong> 對相關主題有興趣的夥伴
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <button 
            onClick={handlePublish}
            disabled={!ideaContent.trim()}
            className="w-full py-4 rounded-lg font-medium transition-colors text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: ideaContent.trim() ? '#16b9b3' : '#d1d5db',
              color: 'white'
            }}
          >
            分享想法
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileIdeaSharingInterface;