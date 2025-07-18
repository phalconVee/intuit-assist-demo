import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TaxData {
  personalInfo: {
    name: string;
    filingStatus: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
    dependents: number;
    age: number;
    state: string;
  };
  income: {
    w2Income: number;
    freelanceIncome: number;
    interestIncome: number;
    dividendIncome: number;
    capitalGains: number;
    rsus: {
      hasRSUs: boolean;
      vestingEvents: Array<{
        date: string;
        shares: number;
        fmv: number;
        company: string;
      }>;
    };
    cryptoGains: number;
    rentalIncome: number;
  };
  deductions: {
    mortgageInterest: number;
    stateLocalTaxes: number;
    charitableDonations: number;
    medicalExpenses: number;
    businessExpenses: number;
    homeOfficeDeduction: boolean;
  };
  investments: {
    brokerageAccounts: string[];
    retirementContributions: {
      traditional401k: number;
      roth401k: number;
      traditionalIRA: number;
      rothIRA: number;
    };
    hsa: {
      contributions: number;
      distributions: number;
    };
  };
  previousYearData: {
    agi: number;
    refund: number;
    taxesOwed: number;
  };
  flags: {
    hasComplexInvestments: boolean;
    hasBusinessIncome: boolean;
    hasRentalProperty: boolean;
    hasInternationalIncome: boolean;
    needsScheduleC: boolean;
    needsScheduleD: boolean;
  };
}

interface TaxDataContextType {
  taxData: TaxData;
  updateTaxData: (updates: Partial<TaxData>) => void;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  userActivity: {
    lastInteraction: Date;
    timeOnScreen: number;
    pauseDetected: boolean;
  };
  updateActivity: () => void;
}

const TaxDataContext = createContext<TaxDataContextType | undefined>(undefined);

const initialTaxData: TaxData = {
  personalInfo: {
    name: 'Geoffrey',
    filingStatus: 'single',
    dependents: 0,
    age: 32,
    state: 'NY'
  },
  income: {
    w2Income: 125000,
    freelanceIncome: 15000,
    interestIncome: 450,
    dividendIncome: 1200,
    capitalGains: 3500,
    rsus: {
      hasRSUs: true,
      vestingEvents: [
        {
          date: '2023-03-15',
          shares: 100,
          fmv: 180.50,
          company: 'TechCorp Inc.'
        },
        {
          date: '2023-09-15',
          shares: 100,
          fmv: 195.75,
          company: 'TechCorp Inc.'
        }
      ]
    },
    cryptoGains: 2800,
    rentalIncome: 0
  },
  deductions: {
    mortgageInterest: 12000,
    stateLocalTaxes: 10000,
    charitableDonations: 2500,
    medicalExpenses: 800,
    businessExpenses: 3200,
    homeOfficeDeduction: true
  },
  investments: {
    brokerageAccounts: ['Fidelity', 'Charles Schwab'],
    retirementContributions: {
      traditional401k: 22500,
      roth401k: 0,
      traditionalIRA: 0,
      rothIRA: 6500
    },
    hsa: {
      contributions: 3850,
      distributions: 500
    }
  },
  previousYearData: {
    agi: 118000,
    refund: 2400,
    taxesOwed: 0
  },
  flags: {
    hasComplexInvestments: true,
    hasBusinessIncome: true,
    hasRentalProperty: false,
    hasInternationalIncome: false,
    needsScheduleC: true,
    needsScheduleD: true
  }
};

export const TaxDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taxData, setTaxData] = useState<TaxData>(initialTaxData);
  const [currentScreen, setCurrentScreen] = useState('income');
  const [userActivity, setUserActivity] = useState({
    lastInteraction: new Date(),
    timeOnScreen: 0,
    pauseDetected: false
  });

  const updateTaxData = (updates: Partial<TaxData>) => {
    setTaxData(prev => ({ ...prev, ...updates }));
  };

  const updateActivity = () => {
    const now = new Date();
    const timeSinceLastInteraction = now.getTime() - userActivity.lastInteraction.getTime();
    const pauseDetected = timeSinceLastInteraction > 30000; // 30 seconds

    setUserActivity({
      lastInteraction: now,
      timeOnScreen: userActivity.timeOnScreen + timeSinceLastInteraction,
      pauseDetected
    });
  };

  return (
    <TaxDataContext.Provider value={{
      taxData,
      updateTaxData,
      currentScreen,
      setCurrentScreen,
      userActivity,
      updateActivity
    }}>
      {children}
    </TaxDataContext.Provider>
  );
};

export const useTaxData = () => {
  const context = useContext(TaxDataContext);
  if (context === undefined) {
    throw new Error('useTaxData must be used within a TaxDataProvider');
  }
  return context;
};