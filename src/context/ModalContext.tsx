import React, { createContext, useContext, useState, useCallback } from 'react';
import { MediaItem } from '../types/media';

interface ModalState {
  isOpen: boolean;
  type: 'movie' | 'tv' | null;
  item: MediaItem | null;
  season?: number;
  episode?: number;
}

interface ModalContextType {
  modalState: ModalState;
  openMovieModal: (item: MediaItem) => void;
  openTVModal: (item: MediaItem, season?: number, episode?: number) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
    item: null,
  });

  const openMovieModal = useCallback((item: MediaItem) => {
    setModalState({
      isOpen: true,
      type: 'movie',
      item,
    });
  }, []);

  const openTVModal = useCallback((item: MediaItem, season = 1, episode = 1) => {
    setModalState({
      isOpen: true,
      type: 'tv',
      item,
      season,
      episode,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      item: null,
    });
  }, []);

  return (
    <ModalContext.Provider
      value={{
        modalState,
        openMovieModal,
        openTVModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
