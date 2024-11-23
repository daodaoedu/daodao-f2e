import { useEffect, useId, useRef, useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import { cn } from "@/utils/cn";

function Item({ children, onClick }) {
  return (
    <li>
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full',
          'text-left px-4 py-2 focus-within:bg-primary-lightest focus-within:outline-primary-lighter',
        )}
        onClick={() => onClick(children)}
      >
        {children}
        <div className="text-xs text-primary-base">新增</div>
      </button>
    </li>
  );
}

function TagEditor({ name, helperText, value = [], control, tagOptions }) {
  const id = useId();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const isComposing = useRef(false);
  const inputRef = useRef(null);
  const tagOptionsRef = useRef(null);
  const tagOptionsFocusIndex = useRef(-1);
  const filteredTagOptions = tagOptions.filter((tag) => input && tag.includes(input));
  const hasTagOptions = Array.isArray(filteredTagOptions) && filteredTagOptions.length;

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
    tagOptionsFocusIndex.current = -1;
    setTimeout(() => {
      if (
        tagOptionsRef.current.contains(document.activeElement) ||
        inputRef.current.contains(document.activeElement)
      ) {
        return;
      }
      setInput('');
      setError('');
    }, 100);
  };

  const handleComposition = (action) => () => {
    isComposing.current = action;
  };

  useEffect(() => {
    control.setRef?.(name, inputRef.current);
  }, [control.setRef, name]);

  useEffect(() => {
    const handleWindowKeyDown = (e) => {
      const buttons = tagOptionsRef.current.querySelectorAll('button');

      switch (e.keyCode) {
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
        case 40: {
          e.preventDefault();
          if (tagOptionsFocusIndex.current >= buttons.length - 1) return;
          tagOptionsFocusIndex.current += 1;
          buttons[tagOptionsFocusIndex.current].focus();
          break;
        }
        default:
          if (e.keyCode === 13) return;
          inputRef.current.focus();
          break;
      }
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [hasTagOptions]);

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
          onCompositionStart={handleComposition(true)}
          onCompositionEnd={handleComposition(false)}
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
            filteredTagOptions.map((tag) => <Item key={tag} onClick={handleAddTag}>{tag}</Item>)
          ) : (
            <Item onClick={handleAddTag}>{input}</Item>
          )}
        </ul>
      </label>
      <div className="mt-2 text-xs text-basic-400">{helperText}</div>
      <div className="text-alert">{error}</div>
    </>
  );
}

export default TagEditor;
