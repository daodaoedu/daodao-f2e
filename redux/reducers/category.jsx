import toast from 'react-hot-toast';
import { getUrlFromCategory } from '../../utils/category';

const initialState = {
  category: [
    {
      name: '1', image: '', link: '', tages: [],
    },
    {
      name: '2', image: '', link: '', tages: [],
    },
    {
      name: '3', image: '', link: '', tages: [],
    },
    {
      name: '4', image: '', link: '', tages: [],
    },
    {
      name: '5', image: '', link: '', tages: [],
    },
    {
      name: '6', image: '', link: '', tages: [],
    },
  ],
  page: {
    name: '',
    intro: '',
    link: '',
  },
  loading: {
    category: true,
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_LOAD_NOTION_TABLE': {
      return {
        ...state,
        loading: {
          ...state.loading,
          category: true,
        },
      };
    }
    case 'LOAD_NOTION_TABLE': {
      // toast.success('讀取資料成功');
      const { results } = action.payload;
      const category = results.map((object) => ({
        id: object.id,
        name: Array.isArray(object.properties['資源名稱 / Name'].title) ? object.properties['資源名稱 / Name'].title[0]?.plain_text : '',
        // link: object.properties['連結 / Link']?.url || '',
        link: `/category/learn/${object.id}`,
        tags: object.properties['標籤 / Hashtag']?.multi_select?.map((tag) => tag.name) || [],
        // image: object.properties['縮圖 / Thumbnail']?.rich_text[0]?.href || '',
        image: getUrlFromCategory(object.properties['縮圖 / Thumbnail']),
      }));

      return {
        ...state,
        category,
        loading: {
          ...state.loading,
          category: false,
        },
      };
    }
    case 'LOAD_NOTION_PAGE': {
      const { properties } = action.payload;
      const payload = {
        name: properties['資源名稱 / Name']?.title[0]?.plain_text || '',
        intro: properties['介紹 / Introduction']?.rich_text[0]?.plain_text || '',
        link: properties['連結 / Link']?.url || '',
        tags: properties['標籤 / Hashtag']?.multi_select?.map((tag) => tag.name) || [],
        image: properties['縮圖 / Thumbnail'].type === 'files'
          ? (properties['縮圖 / Thumbnail']?.files[0]?.name || '')
          : (properties['縮圖 / Thumbnail']?.rich_text[0]?.href || ''),
      };
      return {
        ...state,
        page: payload,
      };
    }
    case 'LOAD_NOTION_TABLE_FAILURE': {
      toast.error('資料異常，如有問題請洽聯絡資訊');
      return {
        ...state,
        loading: {
          ...state.loading,
          category: false,
        },
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
