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
  Circle
} from 'lucide-react';

const IdeaSharingInterface = () => {
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
  const [editedTags, setEditedTags] = useState([]);
  const [editedResources, setEditedResources] = useState([]);
  const [showEditTagSuggestions, setShowEditTagSuggestions] = useState(false);
  const [editCustomTagInput, setEditCustomTagInput] = useState('');
  const [showEditResourceInput, setShowEditResourceInput] = useState(false);
  const [editNewResourceName, setEditNewResourceName] = useState('');
  const [editNewResourceUrl, setEditNewResourceUrl] = useState('');
  const [editUrlError, setEditUrlError] = useState('');

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

  const startEditResource = (resource) => {
    setEditingResourceId(resource.id);
    setEditResourceName(resource.title);
    setEditResourceUrl(resource.url);
  };

  const saveEditResource = () => {
    setUrlError('');
    
    if (editResourceName.trim() && editResourceUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(editResourceUrl.trim())) {
        setUrlError('請輸入有效的網址格式，例如：https://example.com');
        return;
      }
      
      setResources(resources.map(resource => 
        resource.id === editingResourceId 
          ? { ...resource, title: editResourceName.trim(), url: editResourceUrl.trim() }
          : resource
      ));
      
      setEditingResourceId(null);
      setEditResourceName('');
      setEditResourceUrl('');
      setUrlError('');
    }
  };

  const cancelEditResource = () => {
    setEditingResourceId(null);
    setEditResourceName('');
    setEditResourceUrl('');
    setUrlError('');
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
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
    setEditedTags([...(publishedData?.tags || [])]);
    setEditedResources([...(publishedData?.resources || [])]);
    setShowOptionsMenu(false);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      setPublishedData({
        ...publishedData,
        content: editedContent.trim(),
        tags: editedTags,
        resources: editedResources
      });
      setIsEditingPost(false);
      setEditedContent('');
      setEditedTags([]);
      setEditedResources([]);
      setShowEditTagSuggestions(false);
      setEditCustomTagInput('');
      setShowEditResourceInput(false);
      setEditNewResourceName('');
      setEditNewResourceUrl('');
      setEditUrlError('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPost(false);
    setEditedContent('');
    setEditedTags([]);
    setEditedResources([]);
    setShowEditTagSuggestions(false);
    setEditCustomTagInput('');
    setShowEditResourceInput(false);
    setEditNewResourceName('');
    setEditNewResourceUrl('');
    setEditUrlError('');
  };

  const handleEditTagClick = (tag) => {
    if (!editedTags.find(t => t.id === tag.id) && editedTags.length < 3) {
      setEditedTags([...editedTags, tag]);
    }
    setShowEditTagSuggestions(false);
  };

  const createEditCustomTag = () => {
    if (editCustomTagInput.trim() && !editedTags.find(t => t.name.toLowerCase() === editCustomTagInput.trim().toLowerCase()) && editedTags.length < 3) {
      const newTag = {
        id: Date.now(),
        name: editCustomTagInput.trim(),
        category: 'custom',
        count: 1
      };
      setEditedTags([...editedTags, newTag]);
      setEditCustomTagInput('');
      setShowEditTagSuggestions(false);
    }
  };

  const removeEditTag = (tagId) => {
    setEditedTags(editedTags.filter(t => t.id !== tagId));
  };

  const addEditNewResource = () => {
    setEditUrlError('');
    
    if (editNewResourceName.trim() && editNewResourceUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(editNewResourceUrl.trim())) {
        setEditUrlError('請輸入有效的網址格式，例如：https://example.com');
        return;
      }
      
      const newResource = {
        id: Date.now(),
        title: editNewResourceName.trim(),
        url: editNewResourceUrl.trim(),
        type: 'custom'
      };
      setEditedResources([...editedResources, newResource]);
      setEditNewResourceName('');
      setEditNewResourceUrl('');
      setShowEditResourceInput(false);
      setEditUrlError('');
    }
  };

  const removeEditResource = (resourceId) => {
    setEditedResources(editedResources.filter(r => r.id !== resourceId));
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
      article: <FileText size={16} />,
      course: <Video size={16} />,
      book: <BookOpen size={16} />,
      website: <Globe size={16} />
    };
    return icons[type] || <Link size={16} />;
  };

  if (showPostList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full overflow-hidden">
          <div style={{ background: 'linear-gradient(to right, #16b9b3, #0f3036)' }} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={handleBackToCreation}
                className="text-white hover:text-gray-200 transition-colors mr-4"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-white text-lg font-medium">想法</h1>
            </div>
            <button 
              onClick={handleBackToCreation}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
            >
              分享新想法
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {allPosts.map(post => (
                <div key={post.id} className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md relative" style={{ backgroundColor: '#99ecff20', borderColor: '#16b9b360' }}>
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 text-white" style={{ backgroundColor: '#ffa10b' }}>
                      想法
                    </span>
                    <span className="text-xs text-gray-500">
                      {post.date}
                    </span>
                    <div className="relative">
                      <button
                        className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPostOptionsMenu(showPostOptionsMenu === post.id ? null : post.id);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                      
                      {showPostOptionsMenu === post.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                          <button 
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPostOptionsMenu(null);
                            }}
                          >
                            <Bookmark size={14} className="mr-2" />
                            儲存
                          </button>
                          <button 
                            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPostOptionsMenu(null);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                              <line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                            檢舉
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center mb-3 pr-20">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <User size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-sm mr-2" style={{ color: '#0f3036' }}>{post.author}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {post.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#0f3036' }}>{post.content}</p>
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200 transition-colors hover:bg-gray-200"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {post.resources && post.resources.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {post.resources.map(resource => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 rounded-lg hover:bg-opacity-60 transition-colors cursor-pointer"
                          style={{ backgroundColor: '#99ecff30' }}
                        >
                          <div className="mr-2" style={{ color: '#16b9b3' }}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <span className="text-xs hover:underline" style={{ color: '#0f3036' }}>{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-start pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-teal-500 transition-colors group">
                        <Shell size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-blue-500 transition-colors group">
                        <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm ml-1">{post.comments}</span>
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-green-500 transition-colors group">
                        <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPublished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full overflow-hidden">
          <div style={{ background: 'linear-gradient(to right, #16b9b3, #0f3036)' }} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={handleBackToForm}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="p-4 rounded-lg border relative transition-all duration-200 pb-12" style={{ backgroundColor: '#99ecff20', borderColor: '#16b9b360' }}>
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 text-white" style={{ backgroundColor: '#ffa10b' }}>
                  想法
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(new Date())}
                </span>
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 hover:bg-gray-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
                
                {showOptionsMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-24">
                    <button 
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                      onClick={handleEditPost}
                    >
                      <Edit size={14} className="mr-2" />
                      編輯
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Bookmark size={14} className="mr-2" />
                      儲存
                    </button>
                    <button 
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowDeleteConfirmation('idea-post');
                      }}
                    >
                      <Trash2 size={14} className="mr-2" />
                      刪除
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                        <line x1="4" y1="22" x2="4" y2="15"/>
                      </svg>
                      檢舉
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-medium" style={{ backgroundColor: '#16b9b3' }}>
                  林
                </div>
                <div>
                  <div className="font-medium text-sm" style={{ color: '#0f3036' }}>林小明</div>
                  <div className="text-xs text-gray-500 mt-1">
                    UX設計師 | 產品經理
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                {isEditingPost ? (
                  <div className="space-y-4">
                    <div>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 whitespace-pre-wrap"
                        rows="4"
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-400 text-right">
                        {editedContent.length}/200
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editedContent.trim()}
                        className="px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        style={{ backgroundColor: editedContent.trim() ? '#16b9b3' : '#d1d5db' }}
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#0f3036' }}>{publishedData?.content}</p>
                )}
              </div>
              
              {!isEditingPost && publishedData?.tags && publishedData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {publishedData.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200 transition-colors hover:bg-gray-200"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              
              {!isEditingPost && publishedData?.resources && publishedData.resources.length > 0 && (
                <div className="space-y-2 mb-3">
                  {publishedData.resources.map(resource => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 rounded-lg hover:bg-opacity-60 transition-colors cursor-pointer"
                      style={{ backgroundColor: '#99ecff30' }}
                    >
                      <div className="mr-2" style={{ color: '#16b9b3' }}>
                        {getResourceIcon(resource.type)}
                      </div>
                      <span className="text-xs hover:underline" style={{ color: '#0f3036' }}>{resource.title}</span>
                    </a>
                  ))}
                </div>
              )}
              
              {!isEditingPost && (
                <div className="flex items-center justify-start pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-gray-500 hover:text-teal-500 transition-colors group">
                      <Shell size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                      <span className="text-sm">3</span>
                    </button>
                    <button 
                      onClick={() => setShowComments(!showComments)}
                      className="flex items-center text-gray-500 hover:text-blue-500 transition-colors group"
                    >
                      <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm ml-1">{comments.length}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-green-500 transition-colors group">
                      <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isEditingPost && showComments && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#16b9b3' }}>
                      林
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleCommentKeyPress}
                        placeholder="也分享你的想法..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none transition-all duration-200 whitespace-pre-wrap"
                        rows="2"
                      />
                      <div className="flex justify-end items-center mt-2">
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="p-2 rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: newComment.trim() ? '#16b9b3' : '#d1d5db'
                          }}
                          aria-label="發送評論"
                        >
                          <ArrowUp size={16} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg transition-colors hover:bg-gray-50 relative">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm" style={{ color: '#0f3036' }}>
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500">• {comment.time}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {comment.role}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      
                      <div className="relative">
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCommentOptionsMenu(showCommentOptionsMenu === comment.id ? null : comment.id);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                          </svg>
                        </button>
                        
                        {showCommentOptionsMenu === comment.id && (
                          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-20">
                            <button 
                              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCommentOptionsMenu(null);
                              }}
                            >
                              <Edit size={14} className="mr-2" />
                              編輯
                            </button>
                            <button 
                              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCommentOptionsMenu(null);
                                setShowDeleteConfirmation(comment.id);
                              }}
                            >
                              <Trash2 size={14} className="mr-2" />
                              刪除
                            </button>
                            <button 
                              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCommentOptionsMenu(null);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                                <line x1="4" y1="22" x2="4" y2="15"/>
                              </svg>
                              檢舉
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">確定刪除?</h3>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirmation(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
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
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full overflow-hidden">
        <div style={{ background: 'linear-gradient(to right, #16b9b3, #0f3036)' }} className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center border border-white border-opacity-30 text-white font-medium">
              林
            </div>
            
            <div className="ml-3">
              <div className="text-white font-medium text-sm">林小明</div>
              <div className="text-white text-xs mt-1 opacity-80">
                UX設計師 | 產品經理
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowPostList(true)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <div className="flex items-start">
                <div 
                  className="w-0.5 bg-gray-300 rounded-full mr-4 transition-all duration-200"
                  style={{
                    height: `${Math.max(24, (ideaContent.split('\n').length * 24))}px`
                  }}
                ></div>
                <div className="flex-1">
                  <textarea
                    value={ideaContent}
                    onChange={(e) => setIdeaContent(e.target.value)}
                    placeholder="分享你的學習洞察、重要發現或創新想法..."
                    className="w-full px-0 py-0 border-none resize-none focus:outline-none text-gray-700 leading-6"
                    style={{
                      height: `${Math.max(24, ideaContent.split('\n').length * 24)}px`,
                      minHeight: '24px'
                    }}
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-400 mt-2 text-right">
                    {ideaContent.length}/200
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              className="flex items-center space-x-2 relative transition-all duration-200"
              style={{
                marginTop: ideaContent.length > 0 
                  ? `${Math.max(4, 4 + (ideaContent.length / 200) * 20)}px`
                  : '4px',
                marginLeft: '20px'
              }}
            >
              <div className="relative group">
                <button
                  onClick={handleImageUpload}
                  className="flex items-center px-3 py-2 text-gray-600 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <Image size={18} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 text-gray-500 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10" style={{ fontSize: '10px' }}>
                  添加圖片
                </div>
              </div>
              
              <div className="relative group">
                <button
                  onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                  className="flex items-center px-3 py-2 text-gray-600 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <Hash size={18} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 text-gray-500 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10" style={{ fontSize: '10px' }}>
                  添加領域標籤
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={() => setShowResourceInput(true)}
                  className="flex items-center px-3 py-2 text-gray-600 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <Link size={18} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 text-gray-500 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-64" style={{ fontSize: '10px' }}>
                  分享影片、書籍、文章等資源連結，讓島友們參考
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="mb-6">
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors ${
                      tag.category === 'custom' 
                        ? 'border-cyan-200 text-cyan-700 bg-cyan-100'
                        : getTagCategoryColor(tag.category)
                    }`}
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-2 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showTagSuggestions && (
              <div className="relative">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-2 px-2">建立新標籤</div>
                      <div className="flex space-x-2 px-2">
                        <input
                          type="text"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyPress={handleCustomTagKeyPress}
                          placeholder="輸入新標籤名稱"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                        />
                        <button
                          onClick={createCustomTag}
                          disabled={!customTagInput.trim() || selectedTags.length >= 3}
                          className="px-3 py-2 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                          style={{ backgroundColor: '#16b9b3' }}
                        >
                          新增
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2 px-2">熱門標籤</div>
                    {suggestedTags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag)}
                        className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between group transition-colors hover:bg-gray-100"
                        disabled={selectedTags.find(t => t.id === tag.id) || selectedTags.length >= 3}
                      >
                        <div className="flex items-center">
                          <span className={`text-sm ${selectedTags.find(t => t.id === tag.id) || selectedTags.length >= 3 ? 'text-gray-400' : 'text-gray-700'}`}>
                            {tag.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{tag.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            {resources.length > 0 && (
              <div className="space-y-2 mb-3">
                {resources.map(resource => (
                  editingResourceId === resource.id ? (
                    <div 
                      key={resource.id}
                      className="space-y-3 p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: '#99ecff20',
                        borderColor: '#16b9b360'
                      }}
                    >
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#0f3036' }}>
                          資源名稱
                        </label>
                        <input
                          type="text"
                          value={editResourceName}
                          onChange={(e) => setEditResourceName(e.target.value)}
                          placeholder="例如：設計思考入門指南"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#0f3036' }}>
                          資源連結
                        </label>
                        <input
                          type="url"
                          value={editResourceUrl}
                          onChange={(e) => {
                            setEditResourceUrl(e.target.value);
                            setUrlError('');
                          }}
                          placeholder="https://example.com"
                          className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                            urlError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-teal-500 focus:ring-teal-200'
                          }`}
                        />
                        {urlError && (
                          <p className="text-xs text-red-500 mt-1">{urlError}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={saveEditResource}
                          disabled={!editResourceName.trim() || !editResourceUrl.trim()}
                          className="px-4 py-2 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          style={{ backgroundColor: '#16b9b3' }}
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEditResource}
                          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 rounded-full border transition-colors hover:shadow-sm"
                      style={{ 
                        backgroundColor: '#99ecff40',
                        borderColor: '#99ecff80'
                      }}
                    >
                      <div className="flex items-center">
                        <div className="mr-3" style={{ color: '#16b9b3' }}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <span className="text-sm" style={{ color: '#0f3036' }}>{resource.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditResource(resource)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="編輯資源"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => removeResource(resource.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="刪除資源"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {showResourceInput && (
              <div 
                className="space-y-3 p-4 rounded-lg border"
                style={{ 
                  backgroundColor: '#99ecff20',
                  borderColor: '#16b9b360'
                }}
              >
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0f3036' }}>
                    資源名稱
                  </label>
                  <input
                    type="text"
                    value={newResourceName}
                    onChange={(e) => setNewResourceName(e.target.value)}
                    placeholder="例如：設計思考入門指南"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                    className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      urlError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-teal-500 focus:ring-teal-200'
                    }`}
                  />
                  {urlError && (
                    <p className="text-xs text-red-500 mt-1">{urlError}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={addNewResource}
                    disabled={!newResourceName.trim() || !newResourceUrl.trim()}
                    className="px-4 py-2 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    style={{ backgroundColor: '#16b9b3' }}
                  >
                    新增
                  </button>
                  <button
                    onClick={() => {
                      setShowResourceInput(false);
                      setNewResourceName('');
                      setNewResourceUrl('');
                      setUrlError('');
                    }}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedTags.length > 0 && (
            <div className="mb-6 p-4">
              <div className="flex items-center mb-2">
                <Lightbulb size={18} className="mr-2" style={{ color: '#0f3036' }} />
                <span 
                  className="text-xs font-medium"
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

          <div className="flex justify-end">
            <button 
              onClick={handlePublish}
              disabled={!ideaContent.trim()}
              className="px-6 py-3 rounded-lg font-medium transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default IdeaSharingInterface;