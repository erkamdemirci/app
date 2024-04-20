import React from 'react';
import { cn } from '../../lib/utils';
import { Input } from './input';
import { useDebounce } from '../../hooks/debounce';

export type MultiSelectItem = {
  value: string;
  label: string;
  item?: any;
};

type MultiSelectProps = {
  options: MultiSelectItem[];
  error?: string;
  isLoading: boolean;
  placeholder?: string;
  noOptionsText?: string;
  isAsync: boolean;
  onValueChange?: (value: string) => void;
  renderOption?: (props: { item: any; highlight: string }) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
};

export default function MultiSelect({
  options,
  error,
  placeholder = 'Search',
  noOptionsText = 'No options',
  isLoading = false,
  isAsync = false,
  onValueChange,
  renderOption,
  renderSkeleton
}: MultiSelectProps) {
  const clickableRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<MultiSelectItem[]>([]);
  const [focusedClickableIdx, setFocusedClickableIdx] = React.useState<number>(-1);
  const [debouncedValue, value, setValue] = useDebounce<string>('', 400);

  // Keep clickableRefs.current array in sync with the options and selected items arrays
  React.useEffect(() => {
    if (!options || options.length === 0) return;
    /**
     * clickableRefs array structure:
     * [selected items, search input, options]
     */
    clickableRefs.current = clickableRefs.current.slice(0, options.length + selected.length + 1); // +1 for the input element
  }, [options, selected]);

  // Close dropdown when clicking outside and reset focusedClickableIdx
  React.useEffect(() => {
    const handleOutSideClick = (e: any) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        setFocusedClickableIdx(-1);
      }
    };
    window.addEventListener('mousedown', handleOutSideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutSideClick);
    };
  }, [containerRef]);

  // Call onValueChange when debouncedValue changes if component is async
  React.useEffect(() => {
    if (!isAsync) return;
    if (onValueChange) onValueChange(debouncedValue);
  }, [debouncedValue, onValueChange, isAsync]);

  // Handle keyboard events
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const input = inputRef.current;
      const inputIdx = selected.length;

      if (input) {
        // pop last selected item when backspace or delete is pressed
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '') {
            setSelected((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
          }
        }

        // close the dropdown when escape is pressed
        if (e.key === 'Escape') {
          input.blur();
          setOpen(false);
        }

        // use arrow keys to focus clickable items
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();

          let newIdx = focusedClickableIdx === -1 ? inputIdx : focusedClickableIdx;
          if (e.key === 'ArrowDown') {
            if (newIdx >= inputIdx) {
              // focus the next clickable option
              newIdx = Math.min(newIdx + 1, selected.length + options.length);
            }
          }
          if (e.key === 'ArrowUp') {
            if (newIdx >= inputIdx) {
              // focus the previous clickable option
              newIdx = Math.max(newIdx - 1, inputIdx);
            }
          }
          if (e.key === 'ArrowLeft') {
            if (newIdx <= inputIdx) {
              // focus the previous clickable selected item
              newIdx = Math.max(newIdx - 1, 0);
            }
          }
          if (e.key === 'ArrowRight') {
            if (newIdx <= inputIdx) {
              // focus the next clickable selected item
              newIdx = Math.min(newIdx + 1, selected.length);
            }
          }

          setFocusedClickableIdx(newIdx);
          if (newIdx === inputIdx) input.focus();
          else clickableRefs.current[newIdx]?.focus();
        }
      }
    },
    [setSelected, focusedClickableIdx, options.length, selected.length]
  );

  function handleSearchChange(value: string) {
    // if component is not async, set the onValueChange prop immediately if exist
    if (!isAsync) onValueChange?.(value);
    setValue(value);
  }

  // Unselect an item
  const handleUnselect = React.useCallback(
    (item: MultiSelectItem) => {
      setSelected((prev) => prev.filter((s) => s.value !== item.value));
      if (open && inputRef.current) {
        // focus the input after unselecting an item
        inputRef.current.focus();
        setFocusedClickableIdx(-1);
      }
    },
    [setSelected, open]
  );

  function handleOptionClick(item: MultiSelectItem, refIdx: number) {
    // if the item is already selected, unselect it, otherwise select it
    setSelected((prev) => {
      if (prev.some((s) => s.value === item.value)) {
        setFocusedClickableIdx(refIdx - 1);
        return prev.filter((s) => s.value !== item.value);
      } else {
        setFocusedClickableIdx(refIdx + 1);
        return [...prev, item];
      }
    });
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="flex flex-col w-full h-full overflow-visible bg-transparent rounded-xl text-popover-foreground"
    >
      <span className="mx-auto mb-2 text-base text-center text-gray-400">
        use <b>↑/↓</b> for navigate options, use <b>←/→</b> for navigate selected items and press <b>space</b> to select/deselect
      </span>
      <div className="px-3 py-2 text-sm border rounded-xl bg-white group border-input shadow-sm focus-within:border-[#94a3b8]">
        <div className="relative flex flex-wrap gap-1">
          {selected.map((item, idx) => {
            return (
              <div key={item.value} className="flex border-transparent bg-[#e2e8f0] px-2 py-1 rounded-lg w-fit">
                <span className="font-semibold whitespace-nowrap text-[#334155]">{item.label}</span>
                <button
                  tabIndex={idx}
                  ref={(el) => (clickableRefs.current[idx] = el)}
                  className="text-[10px] font-bold bg-[#94a3b8] text-white w-5 h-5 ml-2 rounded-md "
                  onClick={() => handleUnselect(item)}
                >
                  ✕
                </button>
              </div>
            );
          })}
          <Input
            ref={inputRef}
            value={value}
            autoFocus
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              setOpen(true);
              setFocusedClickableIdx(selected.length);
            }}
            placeholder={placeholder}
            className={cn('flex-1 min-w-24 h-fit border-0 outline-none px-2')}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 bg-white z-10 w-full overflow-hidden border border-[#94a3b8] outline-none rounded-xl bg-popover text-popover-foreground animate-in">
            <div className="flex flex-col max-h-[40vh] overflow-y-auto divide-y-[1px] divide-[#94a3b8] text-foreground h-full">
              {isLoading &&
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex items-center px-2 py-1.5 text-sm animate-pulse">
                    {renderSkeleton ? renderSkeleton() : <div className="w-full h-5 bg-gray-200 rounded-md"></div>}
                  </div>
                ))}
              {!isLoading && (
                <>
                  {options?.length ? (
                    options.map((item, idx) => {
                      const refIdx = selected.length + idx + 1;
                      return (
                        <button
                          tabIndex={refIdx}
                          id={item.value}
                          ref={(el) => (clickableRefs.current[refIdx] = el)}
                          className={cn(
                            'relative w-full flex cursor-pointer select-none items-center text-foreground pl-10 pr-2 py-1.5 text-sm outline-none border-[#94a3b8]',
                            focusedClickableIdx === refIdx && 'border-l-4'
                          )}
                          key={item.value}
                          onClick={() => {
                            handleOptionClick(item, refIdx);
                          }}
                        >
                          <input
                            checked={selected.some((s) => s.value === item.value)}
                            onChange={() => {}}
                            type="checkbox"
                            className="absolute transform -translate-y-1/2 left-2.5 top-1/2"
                          />
                          {renderOption ? renderOption({ item: item.item, highlight: debouncedValue }) : item.label}
                        </button>
                      );
                    })
                  ) : (
                    <span className={cn('p-4', error ? 'text-red-500' : 'opacity-50')}>{error ?? noOptionsText}</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
