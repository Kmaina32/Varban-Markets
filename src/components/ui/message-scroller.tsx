'use client';

/**
 * @fileOverview Institutional Message Scroller implementation.
 * Self-contained scrolling logic to ensure platform stability.
 */

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { ChevronDown } from "lucide-react"

interface MessageScrollerContextType {
  scrollToBottom: () => void;
  isAtBottom: boolean;
  setIsAtBottom: (val: boolean) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

const MessageScrollerContext = React.createContext<MessageScrollerContextType | null>(null);

export function MessageScrollerProvider({ children }: { children: React.ReactNode }) {
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const value = React.useMemo(() => ({ 
    scrollToBottom, 
    isAtBottom, 
    setIsAtBottom,
    viewportRef 
  }), [scrollToBottom, isAtBottom]);

  return (
    <MessageScrollerContext.Provider value={value}>
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        {children}
      </div>
    </MessageScrollerContext.Provider>
  );
}

export function useMessageScroller() {
  const context = React.useContext(MessageScrollerContext);
  if (!context) throw new Error("useMessageScroller must be used within MessageScrollerProvider");
  return context;
}

export const MessageScroller = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex h-full w-full flex-col overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
);

export const MessageScrollerViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { viewportRef, setIsAtBottom, scrollToBottom } = useMessageScroller();

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const atBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 10;
      setIsAtBottom(atBottom);
    };

    React.useEffect(() => {
      scrollToBottom();
    }, [children, scrollToBottom]);

    return (
      <div 
        ref={viewportRef}
        onScroll={handleScroll}
        className={cn("flex-1 overflow-y-auto p-2 no-scrollbar", className)} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const MessageScrollerContent = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("flex flex-col gap-4 min-h-full", className)}>
    {children}
  </div>
);

export const MessageScrollerItem = ({ children, messageId, scrollAnchor }: { children: React.ReactNode, messageId?: string, scrollAnchor?: boolean }) => (
  <div data-message-id={messageId} data-anchor={scrollAnchor} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
    {children}
  </div>
);

export const MessageScrollerButton = () => {
  const { scrollToBottom, isAtBottom } = useMessageScroller();
  
  if (isAtBottom) return null;

  return (
    <button
      onClick={scrollToBottom}
      className="absolute bottom-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-lg transition-all hover:bg-[#0055FF] animate-in fade-in zoom-in duration-200"
    >
      <ChevronDown className="h-4 w-4" />
    </button>
  );
};
