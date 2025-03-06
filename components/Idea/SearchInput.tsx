import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { MdMic, MdSearch } from 'react-icons/md';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

const Speech = dynamic(() => import('@/shared/components/Speech'), {
  ssr: false,
});

const SearchInput: React.FC = () => {
  const [getSearchParams, pushState] = useSearchParamsManager();
  const [keyword, setKeyword] = useState('');
  const [isSpeechMode, setIsSpeechMode] = useState(false);
  const currentKeyword = getSearchParams('search').toString();

  useEffect(() => {
    setKeyword(currentKeyword);
  }, [currentKeyword]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushState('search', keyword);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full relative flex items-center border border-[#dbdbdb] rounded-[20px] md:rounded-[30px] pr-1 overflow-hidden"
    >
      <input
        type="search"
        aria-label="search group"
        name="search"
        value={keyword}
        placeholder="想尋找什麼想法呢？"
        onChange={handleChange}
        className="flex-1 py-[14px] pl-[20px] bg-white z-10 rounded-[20px] w-full text-[14px] outline-none"
      />
      {isSpeechMode && (
        <Speech lang="zh-tw" setIsSpeechMode={setIsSpeechMode} />
      )}
      <button
        type="button"
        aria-label="speech"
        onClick={() => setIsSpeechMode(true)}
        className="text-[#536166] rounded-[40px] h-[40px] w-[40px] flex items-center justify-center"
      >
        <MdMic size={24} />
      </button>
      <button
        type="submit"
        aria-label="search"
        className="text-[#536166] rounded-[40px] h-[40px] w-[40px] flex items-center justify-center"
      >
        <MdSearch size={24} />
      </button>
    </form>
  );
};

export default SearchInput;