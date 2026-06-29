"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import toast from "react-hot-toast";

export interface BetSelection {
  id: string; // Unique ID for the slip
  matchId: string;
  matchTitle: string;
  selection: string; // "Home", "Away", "Draw", etc.
  odds: number;
}

interface BetContextType {
  selections: BetSelection[];
  addSelection: (bet: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  isSlipOpen: boolean;
  setIsSlipOpen: (isOpen: boolean) => void;
}

const BetContext = createContext<BetContextType>({
  selections: [],
  addSelection: () => {},
  removeSelection: () => {},
  clearSelections: () => {},
  isSlipOpen: false,
  setIsSlipOpen: () => {},
});

export function BetProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const addSelection = (bet: BetSelection) => {
    // Prevent same match multiple selections for simplicity
    if (selections.some((s) => s.matchId === bet.matchId)) {
      toast.error("Bu maça zaten bir bahis eklediniz.");
      return;
    }
    setSelections((prev) => [...prev, bet]);
    setIsSlipOpen(true);
    toast.success("Bahis kupona eklendi!");
  };

  const removeSelection = (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const clearSelections = () => {
    setSelections([]);
  };

  return (
    <BetContext.Provider value={{ selections, addSelection, removeSelection, clearSelections, isSlipOpen, setIsSlipOpen }}>
      {children}
    </BetContext.Provider>
  );
}

export const useBet = () => useContext(BetContext);
