import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  Home,
  Send,
  X,
  Upload,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { useTaxData } from '../contexts/TaxDataContext';
import { TransactionUploader } from './TransactionUploader';
import { ScheduleDForm } from './ScheduleDForm';
import { CapitalGainsSummary, Transaction, CapitalGainsCalculator } from '../services/capitalGainsCalculator';

interface AssistantSuggestion {
  id: string;
  type: 'calculation' | 'reminder' | 'optimization' | 'question' | 'warning';
  title: string;
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  icon: React.ComponentType<any>;
}

interface InactivityPrompt {
  id: string;
  message: string;
  timestamp: Date;
  responded: boolean;
}

interface ContextAwareAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContextAwareAssistant: React.FC<ContextAwareAssistantProps> = ({ isOpen, onClose }) => {
  const { taxData, currentScreen, userActivity, updateActivity } = useTaxData();
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [showTransactionUploader, setShowTransactionUploader] = useState(false);
  const [showScheduleD, setShowScheduleD] = useState(false);
  const [capitalGainsSummary, setCapitalGainsSummary] = useState<CapitalGainsSummary | null>(null);
  const [processedTransactions, setProcessedTransactions] = useState<Transaction[]>([]);
  const [inactivityPrompts, setInactivityPrompts] = useState<InactivityPrompt[]>([]);
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastInactivityPromptTime, setLastInactivityPromptTime] = useState<Date | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    message: string;
    isUser: boolean;
    timestamp: Date;
    component?: React.ReactNode;
    type?: 'message' | 'inactivity-prompt';
    promptId?: string;
  }>>([]);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // Inactivity detection
  useEffect(() => {
    const resetInactivityTimer = () => {
      setLastActivityTime(new Date());
      
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      const timer = setTimeout(() => {
        showInactivityPrompt();
      }, 20000); // 20 seconds

      setInactivityTimer(timer);
    };

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Listen for user activity
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);

    // Initialize timer
    resetInactivityTimer();

    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
    };
  }, [inactivityTimer]);

  const showInactivityPrompt = () => {
    const now = new Date();
    
    // Don't show if we already have an unanswered prompt
    if (inactivityPrompts.some(p => !p.responded)) {
      return;
    }
    
    // Don't show if we've shown a prompt in the last 2 minutes
    if (lastInactivityPromptTime && (now.getTime() - lastInactivityPromptTime.getTime()) < 120000) {
      return;
    }

    const promptMessages = getInactivityPromptMessage();
    const promptId = `inactivity-${Date.now()}`;
    
    const newPrompt: InactivityPrompt = {
      id: promptId,
      message: promptMessages.message,
      timestamp: new Date(),
      responded: false
    };

    setInactivityPrompts(prev => [...prev, newPrompt]);
    setLastInactivityPromptTime(now);

    // Add to chat messages
    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      message: promptMessages.message,
      isUser: false,
      timestamp: new Date(),
      type: 'inactivity-prompt',
      promptId: promptId,
      component: (
        <div className="mt-3 space-y-2">
          <button
            onClick={() => handleInactivityResponse(promptId, true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Yes, help me
          </button>
          <button
            onClick={() => handleInactivityResponse(promptId, false)}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            No, I'm good
          </button>
        </div>
      )
    }]);
  };

  const getInactivityPromptMessage = () => {
    const prompts = {
      income: [
        "Need clarity on income reporting?",
        "Still working on your income section?",
        "Questions about W-2 or 1099 forms?",
        "Need help with investment income?"
      ],
      deductions: [
        "Need clarity on deductions?",
        "Questions about what you can deduct?",
        "Need help maximizing your deductions?",
        "Confused about itemizing vs standard deduction?"
      ],
      investments: [
        "Still working on your investments?",
        "Need help with retirement contributions?",
        "Questions about capital gains?",
        "Need clarity on investment accounts?"
      ],
      personal: [
        "Need help with personal information?",
        "Questions about filing status?",
        "Need clarity on dependents?"
      ],
      other: [
        "Need help with other tax situations?",
        "Questions about special circumstances?",
        "Need clarity on additional forms?"
      ],
      state: [
        "Need help with state taxes?",
        "Questions about state deductions?",
        "Need clarity on multi-state filing?"
      ],
      review: [
        "Need help reviewing your return?",
        "Questions about your tax summary?",
        "Want to double-check anything?"
      ],
      final: [
        "Ready to file or need help?",
        "Questions about e-filing?",
        "Need clarity on payment options?"
      ]
    };

    const screenPrompts = prompts[currentScreen as keyof typeof prompts] || prompts.income;
    const randomPrompt = screenPrompts[Math.floor(Math.random() * screenPrompts.length)];
    
    return {
      message: randomPrompt,
      helpText: "I'm here to help you navigate this section."
    };
  };

  const handleInactivityResponse = (promptId: string, needsHelp: boolean) => {
    // Mark prompt as responded
    setInactivityPrompts(prev => 
      prev.map(p => p.id === promptId ? { ...p, responded: true } : p)
    );

    // Clear old inactivity prompts from chat to reduce clutter
    setChatMessages(prev => 
      prev.filter(msg => msg.type !== 'inactivity-prompt' || msg.promptId === promptId)
    );

    // Add response message
    const responseMessage = needsHelp 
      ? "Great! I'm here to help. What specific question do you have about this section?"
      : "No problem! I'll be here if you need me. Just continue at your own pace.";

    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      message: responseMessage,
      isUser: false,
      timestamp: new Date()
    }]);

    // Auto-scroll to the response
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);

    if (needsHelp) {
      // Show relevant suggestions for the current screen
      const contextualHelp = getContextualHelp();
      if (contextualHelp) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: `msg-${Date.now() + 1}`,
            message: contextualHelp,
            isUser: false,
            timestamp: new Date()
          }]);
          
          // Auto-scroll to contextual help
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 600);
          
          // Auto-scroll to the new message after a brief delay
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 100);
        }, 500);
      }
    }
  };

  const getContextualHelp = () => {
    switch (currentScreen) {
      case 'income':
        return "Here are some common questions about the income section:\n\n• How to report W-2 income\n• Understanding 1099 forms\n• Reporting freelance income\n• Capital gains from investments\n\nWhat would you like help with?";
      case 'deductions':
        return "For deductions, I can help with:\n\n• Standard vs itemized deductions\n• Home office deduction\n• Charitable contributions\n• Medical expenses\n• State and local taxes\n\nWhat specific deduction questions do you have?";
      case 'investments':
        return "Investment-related help:\n\n• 401(k) and IRA contributions\n• Capital gains calculations\n• HSA contributions\n• Retirement account limits\n\nWhat investment topic can I clarify?";
      default:
        return "I can help you with any questions about this section. What would you like to know more about?";
    }
  };

  // Generate context-aware suggestions based on current screen and tax data
  const generateSuggestions = (): AssistantSuggestion[] => {
    const suggestions: AssistantSuggestion[] = [];

    // Screen-specific suggestions
    switch (currentScreen) {
      case 'income':
        if (taxData.income.rsus.hasRSUs) {
          suggestions.push({
            id: 'rsu-calculation',
            type: 'calculation',
            title: 'RSU Cost Basis Calculation',
            message: `I see you have ${taxData.income.rsus.vestingEvents.length} RSU vesting events. Want me to calculate your cost basis and tax implications?`,
            action: 'Calculate RSU taxes',
            priority: 'high',
            icon: TrendingUp
          });
        }

        if (taxData.income.freelanceIncome > 0) {
          suggestions.push({
            id: 'schedule-c-reminder',
            type: 'reminder',
            title: 'Schedule C Required',
            message: `With $${taxData.income.freelanceIncome.toLocaleString()} in freelance income, you'll need Schedule C. I can help you maximize business deductions.`,
            action: 'Review business expenses',
            priority: 'medium',
            icon: FileText
          });
        }

        if (taxData.income.cryptoGains > 0) {
          suggestions.push({
            id: 'crypto-reporting',
            type: 'warning',
            title: 'Crypto Tax Reporting',
            message: `Don't forget to report your $${taxData.income.cryptoGains.toLocaleString()} in crypto gains. Need help with Form 8949?`,
            action: 'Review crypto transactions',
            priority: 'high',
            icon: AlertCircle
          });
        }

        // Add investment transaction upload suggestion
        suggestions.push({
          id: 'upload-transactions',
          type: 'calculation',
          title: 'Upload Investment Statements',
          message: 'Upload your brokerage statements to automatically calculate capital gains and populate Schedule D.',
          action: 'Upload transactions',
          priority: 'medium',
          icon: Upload
        });
        break;

      case 'deductions':
        if (taxData.deductions.homeOfficeDeduction && taxData.income.freelanceIncome > 0) {
          suggestions.push({
            id: 'home-office-optimization',
            type: 'optimization',
            title: 'Home Office Deduction',
            message: 'You can deduct home office expenses! Should we calculate the simplified method vs. actual expenses?',
            action: 'Calculate home office deduction',
            priority: 'medium',
            icon: Home
          });
        }

        if (taxData.deductions.stateLocalTaxes >= 10000) {
          suggestions.push({
            id: 'salt-cap-warning',
            type: 'warning',
            title: 'SALT Deduction Cap',
            message: 'Your state and local taxes hit the $10,000 cap. Consider tax planning strategies for next year.',
            priority: 'medium',
            icon: AlertCircle
          });
        }

        if (taxData.deductions.charitableDonations > 0) {
          suggestions.push({
            id: 'charitable-optimization',
            type: 'optimization',
            title: 'Charitable Giving Strategy',
            message: `With $${taxData.deductions.charitableDonations.toLocaleString()} in donations, consider bunching strategies or donor-advised funds.`,
            action: 'Explore giving strategies',
            priority: 'low',
            icon: CheckCircle
          });
        }
        break;

      case 'investments':
        if (taxData.investments.retirementContributions.traditional401k < 22500) {
          const remaining = 22500 - taxData.investments.retirementContributions.traditional401k;
          suggestions.push({
            id: 'retirement-contribution',
            type: 'optimization',
            title: 'Maximize 401(k) Contributions',
            message: `You can contribute $${remaining.toLocaleString()} more to your 401(k) this year. This could save you significant taxes!`,
            action: 'Calculate tax savings',
            priority: 'high',
            icon: TrendingUp
          });
        }

        if (taxData.investments.hsa.contributions < 3850) {
          suggestions.push({
            id: 'hsa-contribution',
            type: 'optimization',
            title: 'HSA Contribution Opportunity',
            message: 'HSA contributions are triple tax-advantaged. Consider maximizing your contribution.',
            action: 'Review HSA benefits',
            priority: 'medium',
            icon: DollarSign
          });
        }
        break;
    }

    // Activity-based suggestions
    if (userActivity.pauseDetected) {
      suggestions.push({
        id: 'pause-help',
        type: 'question',
        title: 'Need Help?',
        message: `You've been on the ${currentScreen} section for a while. Is there something specific I can help you with?`,
        priority: 'medium',
        icon: Clock
      });
    }

    // General optimization suggestions
    if (taxData.income.w2Income > 100000 && !taxData.flags.hasComplexInvestments) {
      suggestions.push({
        id: 'tax-planning',
        type: 'optimization',
        title: 'Tax Planning Opportunity',
        message: 'With your income level, consider advanced tax strategies like backdoor Roth conversions.',
        action: 'Learn about tax strategies',
        priority: 'low',
        icon: Brain
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const handleTransactionsProcessed = (summary: CapitalGainsSummary, transactions: Transaction[]) => {
    setCapitalGainsSummary(summary);
    setProcessedTransactions(transactions);
    setShowTransactionUploader(false);
    setShowScheduleD(true);

    // Add chat message with results
    const message = `Great! I've processed ${transactions.length} transactions and calculated your capital gains. Here's what I found:

📈 **Short-term gains/losses:** ${CapitalGainsCalculator.formatCurrency(summary.totalShortTermGainLoss)}
📉 **Long-term gains/losses:** ${CapitalGainsCalculator.formatCurrency(summary.totalLongTermGainLoss)}
💰 **Net capital gain/loss:** ${CapitalGainsCalculator.formatCurrency(summary.netCapitalGainLoss)}
🧾 **Estimated tax:** ${CapitalGainsCalculator.formatCurrency(summary.taxImplications.estimatedTax)}

I've automatically filled out your Schedule D form below. You can review all the details there.`;

    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      message,
      isUser: false,
      timestamp: new Date()
    }]);
  };
  useEffect(() => {
    setSuggestions(generateSuggestions());
  }, [currentScreen, taxData, userActivity.pauseDetected]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateActivity();
    }, 5000);

    return () => clearInterval(interval);
  }, [updateActivity]);

  const handleSuggestionClick = (suggestion: AssistantSuggestion) => {
    if (expandedSuggestion === suggestion.id) {
      setExpandedSuggestion(null);
    } else {
      setExpandedSuggestion(suggestion.id);
    }

    // Handle specific suggestion actions
    if (suggestion.id === 'upload-transactions' && suggestion.action) {
      setShowTransactionUploader(true);
      setExpandedSuggestion(null);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      message: chatInput,
      isUser: true,
      timestamp: new Date()
    }]);

    // Simple AI response based on keywords
    const response = generatePersonalizedResponse(chatInput);
    
    // Add AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        message: response,
        isUser: false,
        timestamp: new Date()
      }]);
    }, 1000);

    setChatInput('');
  };

  // Clean up old chat messages periodically to prevent clutter
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setChatMessages(prev => {
        // Keep only the last 10 messages and remove old unanswered inactivity prompts
        const filtered = prev.filter(msg => {
          if (msg.type === 'inactivity-prompt') {
            const prompt = inactivityPrompts.find(p => p.id === msg.promptId);
            return prompt && !prompt.responded;
          }
          return true;
        });
        
        // Keep only the most recent 10 messages
        return filtered.slice(-10);
      });
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, [inactivityPrompts]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generatePersonalizedResponse = (userMessage: string): string => {
    const lowerInput = userMessage.toLowerCase();
    
    // EITC (Earned Income Tax Credit) questions
    if (lowerInput.includes('eitc') || lowerInput.includes('earned income tax credit')) {
      const totalEarnedIncome = taxData.income.w2Income + taxData.income.freelanceIncome;
      const filingStatus = taxData.personalInfo.filingStatus;
      const dependents = taxData.personalInfo.dependents;
      
      if (totalEarnedIncome <= 59187 && dependents > 0) { // 2023 EITC limits (simplified)
        return `Based on your W-2 income of ${formatCurrency(taxData.income.w2Income)} and freelance income of ${formatCurrency(taxData.income.freelanceIncome)}, with ${dependents} dependent${dependents > 1 ? 's' : ''}, you likely qualify for the Earned Income Tax Credit! Your total earned income of ${formatCurrency(totalEarnedIncome)} is within the EITC limits for ${filingStatus} filers.`;
      } else if (dependents === 0 && totalEarnedIncome <= 17640) {
        return `With your earned income of ${formatCurrency(totalEarnedIncome)} and no dependents, you may qualify for a small EITC as a ${filingStatus} filer.`;
      } else {
        return `Based on your earned income of ${formatCurrency(totalEarnedIncome)} and ${dependents} dependent${dependents !== 1 ? 's' : ''}, you likely don't qualify for EITC this year. The income limits vary by filing status and number of dependents.`;
      }
    }
    
    // Standard vs Itemized deduction questions
    if (lowerInput.includes('standard deduction') || lowerInput.includes('itemize') || lowerInput.includes('itemized')) {
      const totalItemized = taxData.deductions.mortgageInterest + 
                           taxData.deductions.stateLocalTaxes + 
                           taxData.deductions.charitableDonations + 
                           taxData.deductions.medicalExpenses;
      const standardDeduction = taxData.personalInfo.filingStatus === 'married-joint' ? 27700 : 13850; // 2023 amounts
      
      if (totalItemized > standardDeduction) {
        return `Based on your deductions - mortgage interest (${formatCurrency(taxData.deductions.mortgageInterest)}), state/local taxes (${formatCurrency(taxData.deductions.stateLocalTaxes)}), charitable donations (${formatCurrency(taxData.deductions.charitableDonations)}) - your total itemized deductions of ${formatCurrency(totalItemized)} exceed the standard deduction of ${formatCurrency(standardDeduction)}. You should itemize!`;
      } else {
        return `Your itemized deductions total ${formatCurrency(totalItemized)}, which is less than the standard deduction of ${formatCurrency(standardDeduction)} for ${taxData.personalInfo.filingStatus} filers. You're better off taking the standard deduction.`;
      }
    }
    
    // Retirement contribution questions
    if (lowerInput.includes('401k') || lowerInput.includes('retirement') || lowerInput.includes('ira')) {
      const total401k = taxData.investments.retirementContributions.traditional401k + taxData.investments.retirementContributions.roth401k;
      const totalIRA = taxData.investments.retirementContributions.traditionalIRA + taxData.investments.retirementContributions.rothIRA;
      const remaining401k = 22500 - total401k;
      const remainingIRA = 6500 - totalIRA;
      
      let response = `Looking at your retirement contributions: You've contributed ${formatCurrency(total401k)} to your 401(k) and ${formatCurrency(totalIRA)} to IRAs this year. `;
      
      if (remaining401k > 0) {
        response += `You can still contribute ${formatCurrency(remaining401k)} more to your 401(k). `;
      }
      if (remainingIRA > 0) {
        response += `You can still contribute ${formatCurrency(remainingIRA)} more to IRAs. `;
      }
      
      if (remaining401k <= 0 && remainingIRA <= 0) {
        response += `Great job maxing out your retirement contributions!`;
      }
      
      return response;
    }
    
    // HSA questions
    if (lowerInput.includes('hsa') || lowerInput.includes('health savings')) {
      const hsaContributions = taxData.investments.hsa.contributions;
      const hsaLimit = 3850; // 2023 individual limit
      const remaining = hsaLimit - hsaContributions;
      
      if (remaining > 0) {
        return `You've contributed ${formatCurrency(hsaContributions)} to your HSA this year. You can still contribute ${formatCurrency(remaining)} more to reach the ${formatCurrency(hsaLimit)} limit. HSA contributions are triple tax-advantaged!`;
      } else {
        return `You've maxed out your HSA contributions at ${formatCurrency(hsaContributions)}. Great job taking advantage of this triple tax-advantaged account!`;
      }
    }
    
    // Capital gains questions
    if (lowerInput.includes('capital gains') || lowerInput.includes('schedule d') || lowerInput.includes('stock sales')) {
      return `I see you have ${formatCurrency(taxData.income.capitalGains)} in capital gains this year. For detailed capital gains calculations, I recommend uploading your brokerage statements so I can automatically calculate your gains and losses and populate Schedule D for you.`;
    }
    
    // Crypto questions
    if (lowerInput.includes('crypto') || lowerInput.includes('bitcoin') || lowerInput.includes('cryptocurrency')) {
      if (taxData.income.cryptoGains > 0) {
        return `You have ${formatCurrency(taxData.income.cryptoGains)} in crypto gains to report. Cryptocurrency transactions need to be reported on Form 8949 and Schedule D. Each sale, trade, or exchange is a taxable event.`;
      } else {
        return `I don't see any crypto gains in your current tax data. Remember that cryptocurrency transactions need to be reported on Form 8949 and Schedule D if you had any sales, trades, or exchanges.`;
      }
    }
    
    // Freelance/self-employment questions
    if (lowerInput.includes('freelance') || lowerInput.includes('self employed') || lowerInput.includes('schedule c') || lowerInput.includes('business')) {
      if (taxData.income.freelanceIncome > 0) {
        return `With ${formatCurrency(taxData.income.freelanceIncome)} in freelance income, you'll need to file Schedule C. You can deduct business expenses like your home office (${taxData.deductions.homeOfficeDeduction ? 'which I see you have' : 'if applicable'}) and other business costs totaling ${formatCurrency(taxData.deductions.businessExpenses)}.`;
      } else {
        return `I don't see any freelance income in your current tax data. If you had any self-employment income, you'd need to report it on Schedule C.`;
      }
    }
    
    // State tax questions
    if (lowerInput.includes('state tax') || lowerInput.includes('new york') || lowerInput.includes('ny tax')) {
      return `As a ${taxData.personalInfo.state} resident with W-2 income of ${formatCurrency(taxData.income.w2Income)}, you'll need to file a state return. You've paid ${formatCurrency(taxData.deductions.stateLocalTaxes)} in state and local taxes, which hits the federal SALT deduction cap of $10,000.`;
    }
    
    // Filing status questions
    if (lowerInput.includes('filing status') || lowerInput.includes('married') || lowerInput.includes('single')) {
      return `You're filing as ${taxData.personalInfo.filingStatus.replace('-', ' ')} with ${taxData.personalInfo.dependents} dependent${taxData.personalInfo.dependents !== 1 ? 's' : ''}. This affects your standard deduction amount and tax brackets.`;
    }
    
    // Tax refund/owe questions
    if (lowerInput.includes('refund') || lowerInput.includes('owe') || lowerInput.includes('tax bill')) {
      return `Last year you had an AGI of ${formatCurrency(taxData.previousYearData.agi)} and received a ${formatCurrency(taxData.previousYearData.refund)} refund. This year's outcome will depend on your withholdings and total tax liability based on your current income and deductions.`;
    }
    
    // General tax questions with personalized context
    if (lowerInput.includes('tax') || lowerInput.includes('help')) {
      return `Based on your tax profile - ${formatCurrency(taxData.income.w2Income)} W-2 income, ${taxData.personalInfo.filingStatus.replace('-', ' ')} filing status, and ${taxData.personalInfo.dependents} dependent${taxData.personalInfo.dependents !== 1 ? 's' : ''} - I can provide personalized guidance. What specific area would you like help with?`;
    }
    
    // Default response with context
    return `I'd be happy to help you with that! Based on your tax situation - ${formatCurrency(taxData.income.w2Income)} in W-2 income and filing as ${taxData.personalInfo.filingStatus.replace('-', ' ')} - I can provide personalized guidance. Could you be more specific about what you'd like help with?`;
  };

  const getPriorityColor = (priority: string) => {

    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 flex flex-col z-10 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div>
            <span className="text-lg font-semibold text-gray-800">Intuit Assist</span>
            <p className="text-xs text-gray-600">Context-aware tax help</p>
          </div>
        </div>
        <X className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" onClick={onClose} />
      </div>

      {/* Current Context */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Current Section:</span>
          <span className="text-sm text-blue-600 font-semibold capitalize">{currentScreen}</span>
        </div>
        <div className="text-xs text-gray-500">
          Based on your tax profile and current activity
        </div>
      </div>

      {/* Suggestions */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Personalized Suggestions</h3>
        
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">You're all caught up!</p>
            <p className="text-xs text-gray-500">I'll notify you if I spot any opportunities.</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getPriorityTextColor(suggestion.priority)} bg-white`}>
                  <suggestion.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${getPriorityTextColor(suggestion.priority)}`}>
                      {suggestion.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {suggestion.message}
                  </p>
                  
                  {expandedSuggestion === suggestion.id && suggestion.action && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                        {suggestion.action}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Chat Messages */}
        {chatMessages.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Chat History</h4>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                  msg.isUser 
                    ? 'bg-blue-600 text-white' 
                    : msg.type === 'inactivity-prompt' 
                      ? 'bg-yellow-50 border border-yellow-200 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.type === 'inactivity-prompt' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-700">Need assistance?</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                  {msg.component && (
                    <div className="mt-2">{msg.component}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transaction Uploader Modal */}
        {showTransactionUploader && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Upload Investment Transactions</h4>
              <button
                onClick={() => setShowTransactionUploader(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <TransactionUploader onTransactionsProcessed={handleTransactionsProcessed} />
          </div>
        )}

        {/* Schedule D Form */}
        {showScheduleD && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Schedule D Preview
              </h4>
              <button
                onClick={() => setShowScheduleD(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScheduleDForm capitalGainsSummary={capitalGainsSummary} />
          </div>
        )}
      </div>

      {/* Quick Chat */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Quick Question?</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about your taxes..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleSendMessage}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          I'll provide personalized answers based on your tax situation.
        </p>
      </div>
    </div>
  );
};