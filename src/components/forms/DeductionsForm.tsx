import React, { useState } from 'react';
import { Receipt, Home, Heart, Calculator, Check, AlertCircle } from 'lucide-react';
import { useTaxData } from '../../contexts/TaxDataContext';

export const DeductionsForm: React.FC = () => {
  const { taxData, updateTaxData } = useTaxData();
  const [formData, setFormData] = useState(taxData.deductions);
  const [deductionType, setDeductionType] = useState<'standard' | 'itemized'>('itemized');

  const standardDeduction = taxData.personalInfo.filingStatus === 'married-joint' ? 27700 : 13850;
  const totalItemized = formData.mortgageInterest + formData.stateLocalTaxes + formData.charitableDonations + formData.medicalExpenses;

  const handleInputChange = (field: string, value: number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateTaxData({ deductions: formData });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 lg:p-6 border-b border-gray-200 rounded-t-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Deductions & Credits</h2>
                <p className="text-sm lg:text-base text-gray-600">Maximize your tax savings with deductions and credits</p>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <div className="text-sm text-gray-600">Recommended</div>
              <div className="text-xl lg:text-2xl font-bold text-purple-600">
                {totalItemized > standardDeduction ? 'Itemize' : 'Standard'}
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(Math.max(totalItemized, standardDeduction))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {/* Deduction Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Deduction Method</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  deductionType === 'standard'
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDeductionType('standard')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Standard Deduction</h4>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    deductionType === 'standard' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {deductionType === 'standard' && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(standardDeduction)}
                </div>
                <p className="text-sm text-gray-600">
                  Simple, no documentation required. Most taxpayers choose this option.
                </p>
              </div>

              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  deductionType === 'itemized'
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDeductionType('itemized')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Itemized Deductions</h4>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    deductionType === 'itemized' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {deductionType === 'itemized' && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(totalItemized)}
                </div>
                <p className="text-sm text-gray-600">
                  List specific deductions. Choose this if your total exceeds the standard deduction.
                </p>
                {totalItemized > standardDeduction && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <Calculator className="w-4 h-4 mr-1" />
                    <span>Save {formatCurrency(totalItemized - standardDeduction)} more!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Deductions Details */}
          {deductionType === 'itemized' && (
            <div className="space-y-8">
              {/* Home & Mortgage */}
              <div className="bg-blue-50 p-4 lg:p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-blue-600" />
                  Home & Mortgage
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mortgage Interest
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.mortgageInterest || ''}
                        onChange={(e) => handleInputChange('mortgageInterest', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">From Form 1098</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State & Local Taxes (SALT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.stateLocalTaxes || ''}
                        onChange={(e) => handleInputChange('stateLocalTaxes', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-600">State income + property taxes</p>
                      {formData.stateLocalTaxes >= 10000 && (
                        <div className="ml-2 flex items-center text-amber-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">$10K cap</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.homeOfficeDeduction}
                      onChange={(e) => handleInputChange('homeOfficeDeduction', e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      I have a home office used exclusively for business
                    </span>
                  </label>
                </div>
              </div>

              {/* Charitable Giving */}
              <div className="bg-green-50 p-4 lg:p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-green-600" />
                  Charitable Giving
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cash Donations
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.charitableDonations || ''}
                        onChange={(e) => handleInputChange('charitableDonations', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">To qualified organizations</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-gray-900 mb-2">Donation Tips</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Keep receipts for all donations</li>
                      <li>• $250+ requires written acknowledgment</li>
                      <li>• Non-cash donations need appraisal if $5K+</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Medical & Other */}
              <div className="bg-red-50 p-4 lg:p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Medical & Other Deductions</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Expenses
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.medicalExpenses || ''}
                        onChange={(e) => handleInputChange('medicalExpenses', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Only amount over 7.5% of AGI</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Expenses
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.businessExpenses || ''}
                        onChange={(e) => handleInputChange('businessExpenses', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Unreimbursed business expenses</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Deduction Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mortgage Interest:</span>
                    <span className="font-medium">{formatCurrency(formData.mortgageInterest)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">State & Local Taxes:</span>
                    <span className="font-medium">{formatCurrency(Math.min(formData.stateLocalTaxes, 10000))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Charitable Donations:</span>
                    <span className="font-medium">{formatCurrency(formData.charitableDonations)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Medical Expenses:</span>
                    <span className="font-medium">{formatCurrency(formData.medicalExpenses)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold">
                    <span>Total Itemized Deductions:</span>
                    <span className="text-purple-600">{formatCurrency(totalItemized)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>vs. Standard Deduction:</span>
                    <span>{formatCurrency(standardDeduction)}</span>
                  </div>
                  {totalItemized > standardDeduction && (
                    <div className="flex justify-between text-sm font-medium text-green-600">
                      <span>Additional Tax Savings:</span>
                      <span>{formatCurrency(totalItemized - standardDeduction)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Save & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};