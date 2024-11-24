import { useEffect, useId, useRef, useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import { cn } from "@/utils/cn";

function Item({ children, onClick, text }) {
  return (
    <li>
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full text-primary-base',
          'text-left px-4 py-2 focus-within:bg-primary-lightest focus-within:outline-primary-lighter',
        )}
        onClick={() => onClick(text)}
      >
        {children || text}
        <div className="text-xs text-primary-base">新增</div>
      </button>
    </li>
  );
}

function TagEditor({ name, helperText, control, value = [], tagOptions }) {
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
        handleDelete(lastTag)();
        break;
      }
      default:
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (
        tagOptionsRef.current.contains(document.activeElement) ||
        inputRef.current.contains(document.activeElement)
      ) {
        return;
      }
      tagOptionsFocusIndex.current = -1;
      setInput('');
      setError('');
    }, 100);
  };

  const handleNavigateTagOptions = (e) => {
    const buttons = tagOptionsRef.current.querySelectorAll('button');

    switch (e.keyCode) {
      /** 38 方向鍵上 */
      case 38: {
        e.preventDefault();
        if (tagOptionsFocusIndex.current < 1) {
          inputRef.current.focus();
          return;
        }
        tagOptionsFocusIndex.current -= 1;
        buttons[tagOptionsFocusIndex.current].focus();
        break;
      }
      /** 40 方向鍵下 */
      case 40: {
        e.preventDefault();
        if (tagOptionsFocusIndex.current >= buttons.length - 1) return;
        tagOptionsFocusIndex.current += 1;
        buttons[tagOptionsFocusIndex.current].focus();
        break;
      }
      /** 9 Tab */
      case 9: {
        tagOptionsFocusIndex.current += 1;
        break;
      }
      /** 13 Enter */
      case 13: break;
      default:
        inputRef.current.focus();
        break;
    }
  };

  useEffect(() => {
    control.setRef?.(name, inputRef.current);
  }, [control.setRef, name]);

  return (
    <>
      <label
        htmlFor={id}
        className={cn(
          'relative flex flex-wrap items-center pl-3 py-1.5 gap-1.5 w-full text-sm',
          'rounded border border-solid border-basic-200',
          'outline outline-transparent focus-within:outline-primary-base',
        )}
        onBlur={handleBlur}
        onKeyDown={handleNavigateTagOptions}
      >
        {value.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-primary-lightest"
          >
            <div className="whitespace-nowrap">
              {tag}
            </div>
            <button
              type="button"
              className="text-basic-300"
              onClick={handleDelete(tag)}
            >
              <ClearIcon />
            </button>
          </div>
        ))}
        <input
          id={id}
          ref={inputRef}
          className="px-2 py-0.5 min-w-[var(--min-width)] flex-1 outline-none rounded"
          style={{ '--min-width': `${input.length + 3}em` }}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => { isComposing.current = false; }}
          onFocus={() => { tagOptionsFocusIndex.current = -1; }}
        />
        <ul
          ref={tagOptionsRef}
          className={cn(
            'absolute top-full inset-x-0 mt-1',
            'border border-basic-200 rounded-md shadow bg-white',
            'transition-[transform,opacity] origin-top opacity-100 scale-y-100',
            !(hasTagOptions || input) && 'opacity-0 scale-y-0',
            error && 'opacity-0 scale-y-0',
          )}
        >
          {hasTagOptions ? (
            filteredTagOptions.map((tag) => (
              <Item key={tag} text={tag} onClick={handleAddTag}>
                <div>
                  {tag.split(new RegExp(`(${input})`)).map((part, index) => {
                    const key = `${part}-${index}`;
                    return (
                      part === input
                        ? part
                        : <span key={key} className="text-black">{part}</span>
                    );
                  })}
                </div>
              </Item>
            ))
          ) : (
            <Item text={input} onClick={handleAddTag} />
          )}
        </ul>
      </label>
      <div className="mt-2 text-xs text-basic-400">{helperText}</div>
      <div className="text-alert">{error}</div>
    </>
  );
}

export default TagEditor;
