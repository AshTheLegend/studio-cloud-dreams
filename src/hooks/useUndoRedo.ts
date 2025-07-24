import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useUndoRedo = <T>(initialState: T) => {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const setState = useCallback((newState: T) => {
    setHistory(prevHistory => ({
      past: [...prevHistory.past, prevHistory.present].slice(-20), // Keep last 20 states
      present: newState,
      future: []
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.past.length === 0) return prevHistory;
      
      const previous = prevHistory.past[prevHistory.past.length - 1];
      const newPast = prevHistory.past.slice(0, prevHistory.past.length - 1);
      
      return {
        past: newPast,
        present: previous,
        future: [prevHistory.present, ...prevHistory.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.future.length === 0) return prevHistory;
      
      const next = prevHistory.future[0];
      const newFuture = prevHistory.future.slice(1);
      
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};