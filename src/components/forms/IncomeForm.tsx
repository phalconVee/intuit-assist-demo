import React, { useState } from 'react';
import { DollarSign, FileText, TrendingUp, Building, Plus, Trash2, Check } from 'lucide-react';
import { useTaxData } from '../../contexts/TaxDataContext';

export const IncomeForm: React.FC = () => {
  const { taxData, updateTaxData } = useTaxData();
  const [formData, setFormData] = useState(taxData.income);
  const [activeTab, setActiveTab] = useState('w2');

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRSUChange = (index: number, field: string, value: any) => {
    const newVestingEvents = [...formData.rsus.vestingEvents];
    newVestingEvents[index] = { ...newVestingEvents[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      rsus: { ...prev.rsus, vestingEvents: newVestingEvents }
    }));
  };

  const addRSUEvent = () => {
    setFormData(prev => ({
      ...prev,
      rsus: {
        ...prev.rsus,
        hasRSUs: true,
        vestingEvents: [
          ...prev.rsus.vestingEvents,
          { date: '', shares: 0, fmv: 0, company: '' }
        ]
      }
    }));
  };

  const removeRSUEvent = (index: number) => {
    const newVestingEvents = formData.rsus.vestingEvents.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      rsus: {
        ...prev.rsus,
        vestingEvents: newVestingEvents,
        hasRSUs: newVestingEvents.length > 0
      }
    }));
  };

  const handleSave = () => {
    updateTaxData({ income: formData });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const tabs = [
    { id: 'w2', label: 'W-2 Income', icon: Building },
    { id: 'freelance', label: 'Self-Employment', icon: FileText },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'other', label: 'Other Income', icon: DollarSign }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Income & Expenses</h2>
                <p className="text-gray-600">Report all sources of income for the tax year</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  formData.w2Income + 
                  formData.freelanceIncome + 
                  formData.interestIncome + 
                  formData.dividendIncome + 
                  formData.capitalGains + 
                  formData.cryptoGains + 
                  formData.rentalIncome
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {/* W-2 Income Tab */}
          {activeTab === 'w2' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">W-2 Wages and Salary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total W-2 Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.w2Income || ''}
                      onChange={(e) => handleInputChange('w2Income', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Enter the total from all W-2 forms (Box 1)
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">RSU Income</h4>
                  <div className="space-y-4">
                    {formData.rsus.vestingEvents.map((event, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Vesting Event {index + 1}</span>
                          <button
                            onClick={() => removeRSUEvent(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Company"
                            value={event.company}
                            onChange={(e) => handleRSUChange(index, 'company', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="date"
                            value={event.date}
                            onChange={(e) => handleRSUChange(index, 'date', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Shares"
                            value={event.shares || ''}
                            onChange={(e) => handleRSUChange(index, 'shares', parseFloat(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              placeholder="FMV"
                              value={event.fmv || ''}
                              onChange={(e) => handleRSUChange(index, 'fmv', parseFloat(e.target.value) || 0)}
                              className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addRSUEvent}
                      className="w-full py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add RSU Vesting Event</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Freelance Income Tab */}
          {activeTab === 'freelance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Self-Employment Income</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Freelance/Contract Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.freelanceIncome || ''}
                      onChange={(e) => handleInputChange('freelanceIncome', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Income from 1099-NEC and other self-employment
                  </p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tax Implications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Self-Employment Tax:</span>
                      <span className="font-medium">{formatCurrency(formData.freelanceIncome * 0.1413)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quarterly Estimated Tax:</span>
                      <span className="font-medium">{formatCurrency((formData.freelanceIncome * 0.25) / 4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Investment Income</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.interestIncome || ''}
                      onChange={(e) => handleInputChange('interestIncome', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">From 1099-INT forms</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dividend Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.dividendIncome || ''}
                      onChange={(e) => handleInputChange('dividendIncome', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">From 1099-DIV forms</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capital Gains
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.capitalGains || ''}
                      onChange={(e) => handleInputChange('capitalGains', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Net capital gains/losses</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Income Tab */}
          {activeTab === 'other' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Other Income Sources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cryptocurrency Gains
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.cryptoGains || ''}
                      onChange={(e) => handleInputChange('cryptoGains', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Net gains from crypto transactions</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.rentalIncome || ''}
                      onChange={(e) => handleInputChange('rentalIncome', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Income from rental properties</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
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