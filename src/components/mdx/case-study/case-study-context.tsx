"use client";

import { createContext, useContext, ReactNode } from "react";

interface CaseStudyContextValue {
  secondaryImage?: string;
  secondaryAlt?: string;
  secondaryPosition?: string;
}

const CaseStudyContext = createContext<CaseStudyContextValue>({});

export function CaseStudyProvider({
  secondaryImage,
  secondaryAlt,
  secondaryPosition,
  children,
}: CaseStudyContextValue & { children: ReactNode }) {
  return (
    <CaseStudyContext.Provider value={{ secondaryImage, secondaryAlt, secondaryPosition }}>
      {children}
    </CaseStudyContext.Provider>
  );
}

export function useCaseStudyContext() {
  return useContext(CaseStudyContext);
}
