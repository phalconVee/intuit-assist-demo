import React, { useState } from 'react';
import { TaxDataProvider, useTaxData } from './contexts/TaxDataContext';
import { ContextAwareAssistant } from './components/ContextAwareAssistant';
import { useEffect } from 'react';
import { PersonalInfoForm } from './components/forms/PersonalInfoForm';
import { IncomeForm } from './components/forms/IncomeForm';
import { DeductionsForm } from './components/forms/DeductionsForm';
import { OtherTaxForm } from './components/forms/OtherTaxForm';
import { StateTaxForm } from './components/forms/StateTaxForm';
import { ReviewForm } from './components/forms/ReviewForm';
import { FinalFileForm } from './components/forms/FinalFileForm';
import { 
  User, 
  DollarSign, 
  Receipt, 
  Users, 
  Building, 
  CheckCircle,
  FolderOpen,
  Bell,
  Search,
  HelpCircle,
  X,
  ChevronDown,
  Send,
  ChevronRight,
  Menu
} from 'lucide-react';

function TaxDashboard() {
  const { currentScreen, setCurrentScreen, updateActivity } = useTaxData();
  const [chatInput, setChatInput] = useState('');
  const [isAssistOpen, setIsAssistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());

  // Inactivity detection to auto-open assistant
  useEffect(() => {
    const resetInactivityTimer = () => {
      setLastActivityTime(new Date());
      
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      const timer = setTimeout(() => {
        // Auto-open assistant after 30 seconds of inactivity
        if (!isAssistOpen) {
          setIsAssistOpen(true);
        }
      }, 30000); // 30 seconds

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
  }, [isAssistOpen]); // Remove inactivityTimer from dependencies

  const taxSections = [
    { id: 'personal', title: 'Personal Info', icon: User, completed: true, active: false },
    { id: 'income', title: 'Income & Expenses', icon: DollarSign, completed: true, active: true },
    { id: 'deductions', title: 'Deductions & Credits', icon: Receipt, completed: true, active: false },
    { id: 'other', title: 'Other Tax Situations', icon: Users, completed: true, active: false },
    { id: 'state', title: 'State Taxes', icon: Building, completed: false, active: false },
    { id: 'review', title: 'Review', icon: CheckCircle, completed: true, active: false },
    { id: 'final', title: 'Final & File', icon: FolderOpen, completed: false, active: false }
  ];

  const assistQuestions = [
    "Is my remote income taxable in New York State?",
    "What happens if I don't file my 2023 taxes?",
    "How do you remove the american opportunity tax credit from turbo tax?"
  ];

  // Render the appropriate form based on current screen
  const renderCurrentForm = () => {
    switch (currentScreen) {
      case 'personal':
        return <PersonalInfoForm />;
      case 'income':
        return <IncomeForm />;
      case 'deductions':
        return <DeductionsForm />;
      case 'other':
        return <OtherTaxForm />;
      case 'state':
        return <StateTaxForm />;
      case 'review':
        return <ReviewForm />;
      case 'final':
        return <FinalFileForm />;
      default:
        return null;
    }
  };

  // If we're in a form view, render the form
  if (renderCurrentForm()) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex w-60 bg-[#f4f4ef] border-r border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src="/turbo-checkball.svg" alt="Intuit Logo" className="w-8 h-8" />
              <div>
                <div className="text-sm font-semibold text-gray-800">INTUIT</div>
                <div className="text-lg font-bold text-gray-800">turbotax</div>
                <div className="text-xs text-gray-500">Premium</div>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 py-4">
            <div className="px-4 space-y-1">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="w-full text-left bg-[#ebe9e0] px-3 py-2 rounded-md"
              >
                <div className="text-sm font-medium text-[#d52b1e]">← Back to Tax Home</div>
              </button>
              <div className="px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
                <div className="text-sm text-gray-600">Documents</div>
              </div>
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Intuit Account</div>
            <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Cambiar a español</div>
            <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Sign Out</div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="fixed left-0 top-0 h-full w-64 bg-[#f4f4ef] border-r border-gray-200 flex flex-col z-50">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="/turbo-checkball.svg" alt="Intuit Logo" className="w-8 h-8" />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">INTUIT</div>
                    <div className="text-lg font-bold text-gray-800">turbotax</div>
                    <div className="text-xs text-gray-500">Premium</div>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              <nav className="flex-1 py-4">
                <div className="px-4 space-y-1">
                  <button
                    onClick={() => {
                      setCurrentScreen('dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left bg-[#ebe9e0] px-3 py-2 rounded-md"
                  >
                    <div className="text-sm font-medium text-[#d52b1e]">← Back to Tax Home</div>
                  </button>
                  <div className="px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                </div>
              </nav>
              
              <div className="p-4 border-t border-gray-200 space-y-2">
                <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Intuit Account</div>
                <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Cambiar a español</div>
                <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Sign Out</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button 
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
                
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center space-x-2">
                  <img src="/turbo-checkball.svg" alt="Intuit Logo" className="w-6 h-6" />
                  <span className="text-sm font-semibold text-gray-800">turbotax</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                <Search className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                <HelpCircle className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                <button className="hidden sm:block border border-gray-300 px-3 lg:px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  Live Tax Advice
                </button>
                <div className="flex items-center space-x-2 bg-blue-50 px-2 lg:px-3 py-2 rounded-md">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                  </div>
                  <span 
                    className="text-xs lg:text-sm font-medium text-gray-800 cursor-pointer hover:text-gray-900" 
                    onClick={() => setIsAssistOpen(true)}
                  >
                    <span className="hidden sm:inline">Intuit Assist</span>
                    <span className="sm:hidden">Assist</span>
                  </span>
                  {isAssistOpen && (
                    <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setIsAssistOpen(false)} />
                  )}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 bg-gray-50 overflow-auto">
              <div className="p-4 lg:p-6">
                {renderCurrentForm()}
              </div>
            </div>
          </div>

          {/* Intuit Assist Sidebar */}
          <ContextAwareAssistant 
            isOpen={isAssistOpen} 
            onClose={() => setIsAssistOpen(false)} 
          />
        </div>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex w-60 bg-[#f4f4ef] border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src="/turbo-checkball.svg" alt="Intuit Logo" className="w-8 h-8" />
            <div>
              <div className="text-sm font-semibold text-gray-800">INTUIT</div>
              <div className="text-lg font-bold text-gray-800">turbotax</div>
              <div className="text-xs text-gray-500">Premium</div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-4">
          <div className="px-4 space-y-1">
            <div className="bg-[#ebe9e0] px-3 py-2 rounded-md">
              <div className="text-sm font-medium text-[#d52b1e]">Tax Home</div>
            </div>
            <div className="px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <div className="text-sm text-gray-600">Documents</div>
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Intuit Account</div>
          <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Cambiar a español</div>
          <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Sign Out</div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-[#f4f4ef] border-r border-gray-200 flex flex-col z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/turbo-checkball.svg" alt="Intuit Logo" className="w-8 h-8" />
                <div>
                  <div className="text-sm font-semibold text-gray-800">INTUIT</div>
                  <div className="text-lg font-bold text-gray-800">turbotax</div>
                  <div className="text-xs text-gray-500">Premium</div>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <nav className="flex-1 py-4">
              <div className="px-4 space-y-1">
                <div className="bg-[#ebe9e0] px-3 py-2 rounded-md">
                  <div className="text-sm font-medium text-[#d52b1e]">Tax Home</div>
                </div>
                <div className="px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
              </div>
            </nav>
            
            <div className="p-4 border-t border-gray-200 space-y-2">
              <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Intuit Account</div>
              <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Cambiar a español</div>
              <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">Sign Out</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center space-x-2">
                <img src="/turbo-checkball.svg" alt="Intuit Logo" className="w-6 h-6" />
                <span className="text-sm font-semibold text-gray-800">turbotax</span>
              </div>
              
              {/* Desktop Logo - Hidden on mobile */}
              <div className="hidden lg:flex items-center space-x-3">
                <img src="/turbo-checkball.svg" alt="Intuit Logo" className="w-8 h-8" />
                <div>
                  <div className="text-sm font-semibold text-gray-800">INTUIT</div>
                  <div className="text-lg font-bold text-gray-800">turbotax</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
              <Search className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
              <HelpCircle className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
              <button className="hidden sm:block border border-gray-300 px-3 lg:px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Live Tax Advice
              </button>
              <div className="flex items-center space-x-2 bg-blue-50 px-2 lg:px-3 py-2 rounded-md">
                <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                </div>
                <span 
                  className="text-xs lg:text-sm font-medium text-gray-800 cursor-pointer hover:text-gray-900" 
                  onClick={() => setIsAssistOpen(true)}
                >
                  <span className="hidden sm:inline">Intuit Assist</span>
                  <span className="sm:hidden">Assist</span>
                </span>
                {isAssistOpen && (
                  <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setIsAssistOpen(false)} />
                )}
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 p-4 lg:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 text-center mb-8 lg:mb-12">
                Hi Geoffrey, let's keep working on your taxes!
              </h1>
              
              <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Progress Tracker - Hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex flex-col items-center">
                  <div className="space-y-4">
                    {taxSections.map((section, index) => (
                      <div key={section.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${
                            section.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          {index < taxSections.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax Sections */}
                <div className="flex-1 space-y-3 lg:space-y-4">
                  {taxSections.map((section, index) => (
                    <div 
                      key={section.id} 
                      className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setCurrentScreen(section.id);
                        updateActivity();
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                            section.active ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <section.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${
                              section.active ? 'text-green-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-base lg:text-lg font-semibold text-gray-900">{section.title}</h3>
                          </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intuit Assist Sidebar */}
        <ContextAwareAssistant 
          isOpen={isAssistOpen} 
          onClose={() => setIsAssistOpen(false)} 
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <TaxDataProvider>
      <TaxDashboard />
    </TaxDataProvider>
  );
}

export default App;