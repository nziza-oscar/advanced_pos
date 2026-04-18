// components/ui/ModalManager.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal } from './Modal';

interface ModalConfig {
  id: string;
  title?: string;
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
}

interface ModalContextType {
  openModal: (config: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, config: Partial<ModalConfig>) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = (config: Omit<ModalConfig, 'id'>): string => {
    const id = Math.random().toString(36).substring(7);
    setModals(prev => [...prev, { ...config, id }]);
    return id;
  };

  const closeModal = (id?: string) => {
    if (id) {
      // Close specific modal
      const modal = modals.find(m => m.id === id);
      if (modal?.onClose) {
        modal.onClose();
      }
      setModals(prev => prev.filter(m => m.id !== id));
    } else {
      // Close the most recent modal (top of stack)
      if (modals.length > 0) {
        const lastModal = modals[modals.length - 1];
        if (lastModal.onClose) {
          lastModal.onClose();
        }
        setModals(prev => prev.slice(0, -1));
      }
    }
  };

  const closeAllModals = () => {
    modals.forEach(modal => {
      if (modal.onClose) modal.onClose();
    });
    setModals([]);
  };

  const updateModal = (id: string, config: Partial<ModalConfig>) => {
    setModals(prev =>
      prev.map(modal =>
        modal.id === id ? { ...modal, ...config } : modal
      )
    );
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAllModals, updateModal }}>
      {children}
      {modals.map(modal => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => closeModal(modal.id)}
          title={modal.title}
          size={modal.size}
          closeOnOverlayClick={modal.closeOnOverlayClick}
        >
          {modal.content}
        </Modal>
      ))}
    </ModalContext.Provider>
  );
}