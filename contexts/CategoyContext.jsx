import {
  createContext, useContext, useReducer, useEffect, // useState
} from 'react';
import categoryReducer from './reducers/categoryReducer';

const CategoyContext = createContext();
const initialState = {
  table: [],
};

const loadNotionTable = async () => {
  return fetch('/api/notion/database', {
    method: 'POST',
  }).then((res) => res.json())
    .then((res) => {
      console.log('res::: ', res);
      const list = res.results.map((object) => {
        return {
          image: object.properties['縮圖 / Thumbnail'].files[0].name,
          tags: object.properties['標籤 / Hashtag'].rich_text,
          link: object.properties['連結 / Link'],
          name: object.properties['資源名稱 / Name'].text,
        };
      });

      return list;
    })
    .catch((error) => {
      return error;
    });
};

// context wrapper
export const CategoyProvider = ({ children }) => {
  const [categoryState, dispatch] = useReducer(categoryReducer, initialState);
  console.log('categoryState ', categoryState);
  useEffect(() => {
    loadNotionTable()
      .then((res) => dispatch({ type: 'LOAD_NOTION_TABLE', payload: { data: res } }))
      .catch((error) => console.log('loadNotionTable failed: ', error));
  }, []);
  return (
    <CategoyContext.Provider>
      {children}
    </CategoyContext.Provider>
  );
};

// context hooks
export const useCategoyContext = () => {
  return useContext(CategoyContext);
};
