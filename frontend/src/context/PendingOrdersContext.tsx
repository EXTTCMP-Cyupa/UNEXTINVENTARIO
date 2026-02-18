'use client';

import React, { createContext, useContext, useState } from 'react';

interface PendingOrdersContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const PendingOrdersContext = createContext<PendingOrdersContextType | undefined>(undefined);

export const PendingOrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <PendingOrdersContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </PendingOrdersContext.Provider>
  );
};

export const usePendingOrdersModal = () => {
  const context = useContext(PendingOrdersContext);
  if (context === undefined) {
    throw new Error('usePendingOrdersModal must be used within PendingOrdersProvider');
  }
  return context;
};
