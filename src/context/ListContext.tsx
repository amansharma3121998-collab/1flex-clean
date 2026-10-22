import React, { createContext, useContext, useState, useEffect } from 'react';
import { ContinueWatchingItem, MediaItem } from '../types/media';

interface ListContextType {
  myList: MediaItem[];
  continueWatching: ContinueWatchingItem[];
  ratings: Record<number, 'like' | 'dislike'>;
  addToList: (item: MediaItem) => void;
  removeFromList: (id: number) => void;
  isInList: (id: number) => boolean;
  saveProgress: (progressItem: ContinueWatchingItem) => void;
  removeProgress: (id: number) => void;
  rateMedia: (id: number, rating: 'like' | 'dislike' | null) => void;
  toastMessage: string | null;
  clearToast: () => void;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myList, setMyList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('moviesbox_my_list') || localStorage.getItem('1flex_my_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>(() => {
    try {
      const saved = localStorage.getItem('moviesbox_continue_watching') || localStorage.getItem('1flex_continue_watching');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [ratings, setRatings] = useState<Record<number, 'like' | 'dislike'>>(() => {
    try {
      const saved = localStorage.getItem('moviesbox_ratings') || localStorage.getItem('1flex_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('moviesbox_my_list', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    localStorage.setItem('moviesbox_continue_watching', JSON.stringify(continueWatching));
  }, [continueWatching]);

  useEffect(() => {
    localStorage.setItem('moviesbox_ratings', JSON.stringify(ratings));
  }, [ratings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  const addToList = (item: MediaItem) => {
    setMyList(prev => {
      if (prev.some(m => m.id === item.id)) return prev;
      return [item, ...prev];
    });
    showToast(`Added "${item.title || item.name}" to My List`);
  };

  const removeFromList = (id: number) => {
    const item = myList.find(m => m.id === id);
    setMyList(prev => prev.filter(m => m.id !== id));
    if (item) {
      showToast(`Removed "${item.title || item.name}" from My List`);
    }
  };

  const isInList = (id: number) => {
    return myList.some(m => m.id === id);
  };

  const saveProgress = (progressItem: ContinueWatchingItem) => {
    setContinueWatching(prev => {
      const filtered = prev.filter(p => p.id !== progressItem.id);
      return [{ ...progressItem, updatedAt: Date.now() }, ...filtered].slice(0, 20);
    });
  };

  const removeProgress = (id: number) => {
    setContinueWatching(prev => prev.filter(p => p.id !== id));
  };

  const rateMedia = (id: number, rating: 'like' | 'dislike' | null) => {
    setRatings(prev => {
      const updated = { ...prev };
      if (!rating) {
        delete updated[id];
      } else {
        updated[id] = rating;
      }
      return updated;
    });
    if (rating === 'like') showToast('Rated: Thumbs Up');
    else if (rating === 'dislike') showToast('Rated: Not for me');
  };

  return (
    <ListContext.Provider
      value={{
        myList,
        continueWatching,
        ratings,
        addToList,
        removeFromList,
        isInList,
        saveProgress,
        removeProgress,
        rateMedia,
        toastMessage,
        clearToast: () => setToastMessage(null),
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900/90 text-white border border-zinc-700/80 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-sm font-medium flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </ListContext.Provider>
  );
};

export const useList = () => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useList must be used within a ListProvider');
  }
  return context;
};
