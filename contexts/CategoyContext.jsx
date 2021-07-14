import {
  createContext, useContext, useReducer, useMemo,
} from 'react';
import categoryReducer from './reducers/categoryReducer';

const initialState = {
  category: [
    {
      name: '', image: '', link: '', tages: [],
    },
    {
      name: '', image: '', link: '', tages: [],
    },
    {
      name: '', image: '', link: '', tages: [],
    },
    {
      name: '', image: '', link: '', tages: [],
    },
    {
      name: '', image: '', link: '', tages: [],
    },
    {
      name: '', image: '', link: '', tages: [],
    },
  ],
  loading: {
    category: true,
  },
};

const CategoyContext = createContext();

const fetchNotionDatabase = async (databaseId, query) => {
  // const queryString = Object.keys(query).map((key) => `${key}=${query[key]}`).join('&');
  const queryString = `${query.tags ? `${`?tags=${query.tags}`}` : ''}`;
  return fetch(`https://api.daoedu.tw/notion/databases/${databaseId}${queryString}`, {
    method: 'GET',
  }).then((res) => res.json())
    .then((res) => res.payload.results.map((object) => ({
      name: object.properties['資源名稱 / Name']?.title[0]?.plain_text || '',
      link: object.properties['連結 / Link']?.url || '',
      tags: object.properties['標籤 / Hashtag']?.multi_select?.map((tag) => tag.name) || [],
      // image: object.properties['縮圖 / Thumbnail']?.rich_text[0]?.href || '',
      image: object.properties['縮圖 / Thumbnail'].type === 'files'
        ? (object.properties['縮圖 / Thumbnail']?.files?.name || '')
        : (object.properties['縮圖 / Thumbnail']?.rich_text[0]?.href || ''),
    })))
    .catch((error) => error);
};

// context wrapper
export const CategoyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(categoryReducer, initialState);
  const actions = useMemo(() => {
    return {
      loadNotionTable: (categoryId, query) => {
        dispatch({ type: 'REQUEST_LOAD_NOTION_TABLE' });
        return fetchNotionDatabase(categoryId, query)
          .then((payload) => dispatch({ type: 'LOAD_NOTION_TABLE', payload }))
          .catch((error) => dispatch({ type: 'LOAD_NOTION_TABLE_FAILURE', error }));
      },
    };
  }, []);
  console.log('current state: ', state);
  return (
    <CategoyContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </CategoyContext.Provider>
  );
};

// context hooks
export const useCategoyContext = () => {
  return useContext(CategoyContext);
};
