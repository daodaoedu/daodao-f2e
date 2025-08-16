import {
  useEffect, useId, useRef, useState,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

function Item({ children, onClick, text }) {
  return (
    <li>
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full text-primary-base',
          'text-left px-4 py-2 focus-within:bg-primary-lightest focus-within:outline-primary-lighter'
        )}
        onClick={() => onClick(text)}
      >
        {children || text}
        <div className="text-xs text-primary-base">新增</div>
      </button>
    </li>
  );
}

function TagEditor({
  name, helperText, control, value = [], tagOptions,
}) {
  const id = useId();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const isComposing = useRef(false);
  const inputRef = useRef(null);
  const tagOptionsRef = useRef(null);
  const tagOptionsFocusIndex = useRef(-1);
  const filteredTagOptions = Array.isArray(tagOptions)
    ? tagOptions.filter((tag) => input && tag.includes(input))
    : [];
  const hasTagOptions = !!filteredTagOptions.length;

  const handleChange = (e) => {
    const _value = e.target.value;
    if (_value.length > 8) setError('標籤最多 8 個字');
    else setError('');
    setInput(_value);
  };

  const handleAddTag = (tag) => {
    if (!tag) return;
    if (error) return;
    setInput('');
    inputRef.current.focus();
    if (value.includes(tag)) return;
    control.onChange({
      target: {
        name,
        value: [...value, tag],
      },
    });
  };

  const handleDelete = (tag) => () => {
    control.onChange({
      target: {
        name,
        value: value.filter((t) => t !== tag),
      },
    });
  };

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 13: {
        if (isComposing.current) return;
        handleAddTag(input.trim());
        break;
      }
      case 8: {
        if (isComposing.current || input || !value.length) return;
        const lastTag = value[value.length - 1];
        setInput(lastTag);
        control.onChange({
          target: {
            name,
            value: value.filter((t) => t !== lastTag),
          },
        });
        break;
      }
      case 38: {
        if (!hasTagOptions) return;
        tagOptionsFocusIndex.current = Math.max(0, tagOptionsFocusIndex.current - 1);
        tagOptionsRef.current.childNodes[tagOptionsFocusIndex.current].focus();
        break;
      }
      case 40: {
        if (!hasTagOptions) return;
        tagOptionsFocusIndex.current = Math.min(filteredTagOptions.length - 1, tagOptionsFocusIndex.current + 1);
        tagOptionsRef.current.childNodes[tagOptionsFocusIndex.current].focus();
        break;
      }
      default:
        break;
    }
  };

  const handleComposition = (e) => {
    if (e.type === 'compositionend') {
      isComposing.current = false;
    } else {
      isComposing.current = true;
    }
  };

  useEffect(() => {
    tagOptionsFocusIndex.current = -1;
  }, [input]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          id={id}
          ref={inputRef}
          onCompositionStart={handleComposition}
          onCompositionEnd={handleComposition}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={input}
          className={cn(
            'flex-1 rounded-md border border-basic-200 p-2 text-sm outline-none',
            hasTagOptions && 'rounded-b-none border-b-0'
          )}
          placeholder={helperText || '輸入標籤，按 Enter 新增'}
        />
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded-md border border-basic-200 px-3 py-2 text-sm',
            'hover:bg-primary-lightest hover:text-primary-base'
          )}
          onClick={() => handleAddTag(input.trim())}
        >
          新增
        </button>
      </div>

      {hasTagOptions && (
        <ul
          ref={tagOptionsRef}
          className="max-h-32 overflow-y-auto rounded-b-md border border-t-0 border-basic-200 p-2"
        >
          {filteredTagOptions.map((text) => (
            <Item
              key={text}
              text={text}
              onClick={handleAddTag}
            />
          ))}
        </ul>
      )}

      {!!value.length && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li key={tag} className="inline-flex items-center gap-1 rounded-md bg-primary-lightest px-2 py-1 text-sm">
              <span>{tag}</span>
              <button
                type="button"
                onClick={handleDelete(tag)}
                className="text-basic-400 hover:text-primary-base"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TagEditor;
