import React, { useState } from 'react';
import { Users, Briefcase, Globe, Check, AlertTriangle } from 'lucide-react';
import { useTaxData } from '../../contexts/TaxDataContext';

export const OtherTaxForm: React.FC = () => {
  const { taxData, updateTaxData } = useTaxData();
  const [formData, setFormData] = useState({
    hasRentalProperty: taxData.flags.hasRentalProperty,
    hasInternationalIncome: taxData.flags.hasInternationalIncome,
    hasForeignAccounts: false,
    hasAlimony: false,
    hasGamblingWinnings: false,
    hasUnemploymentIncome: false,
    hasRetirementDistributions: false,
    hasSocialSecurity: false,
    hasEducationCredits: false,
    hasChildTaxCredit: taxData.personalInfo.dependents > 0,
    hasEITC: false,
    hasHealthInsurance: true,
    alimonyAmount: 0,
    gamblingWinnings: 0,
    unemploymentIncome: 0,
    retirementDistributions: 0,
    socialSecurityIncome: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateTaxData({
      flags: {
        ...taxData.flags,
        hasRentalProperty: formData.hasRentalProperty,
        hasInternationalIncome: formData.hasInternationalIncome
      }
    });
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
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Other Tax Situations</h2>
              <p className="text-gray-600">Special circumstances and additional income sources</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Special Income Sources */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-orange-600" />
              Special Income Sources
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rental Property */}
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasRentalProperty}
                    onChange={(e) => handleInputChange('hasRentalProperty', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Rental Property Income</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Income from rental real estate, royalties, partnerships, S corporations, trusts, etc.
                </p>
                {formData.hasRentalProperty && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center text-yellow-800 mb-2">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Schedule E Required</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      You'll need to complete Schedule E for rental income and expenses.
                    </p>
                  </div>
                )}
              </div>

              {/* Retirement Distributions */}
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasRetirementDistributions}
                    onChange={(e) => handleInputChange('hasRetirementDistributions', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Retirement Distributions</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Distributions from 401(k), IRA, pension, or annuity
                </p>
                {formData.hasRetirementDistributions && (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.retirementDistributions || ''}
                        onChange={(e) => handleInputChange('retirementDistributions', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Distribution amount"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Social Security */}
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasSocialSecurity}
                    onChange={(e) => handleInputChange('hasSocialSecurity', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Social Security Benefits</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Social Security retirement, disability, or survivor benefits
                </p>
                {formData.hasSocialSecurity && (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.socialSecurityIncome || ''}
                        onChange={(e) => handleInputChange('socialSecurityIncome', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Benefits received"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Unemployment */}
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasUnemploymentIncome}
                    onChange={(e) => handleInputChange('hasUnemploymentIncome', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Unemployment Compensation</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Unemployment benefits received during the tax year
                </p>
                {formData.hasUnemploymentIncome && (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.unemploymentIncome || ''}
                        onChange={(e) => handleInputChange('unemploymentIncome', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Unemployment income"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* International & Foreign */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-orange-600" />
              International & Foreign
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasInternationalIncome}
                    onChange={(e) => handleInputChange('hasInternationalIncome', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Foreign Income</span>
                </label>
                <p className="text-sm text-gray-600">
                  Income earned in foreign countries or from foreign sources
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasForeignAccounts}
                    onChange={(e) => handleInputChange('hasForeignAccounts', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Foreign Bank Accounts</span>
                </label>
                <p className="text-sm text-gray-600">
                  Financial accounts in foreign countries (FBAR may be required)
                </p>
              </div>
            </div>
          </div>

          {/* Tax Credits */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Tax Credits</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasChildTaxCredit}
                    onChange={(e) => handleInputChange('hasChildTaxCredit', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Child Tax Credit</span>
                </label>
                <p className="text-sm text-gray-600">
                  Up to $2,000 per qualifying child under 17
                </p>
                {formData.hasChildTaxCredit && taxData.personalInfo.dependents > 0 && (
                  <div className="mt-3 bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      Potential credit: {formatCurrency(Math.min(taxData.personalInfo.dependents * 2000, taxData.personalInfo.dependents * 2000))}
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasEducationCredits}
                    onChange={(e) => handleInputChange('hasEducationCredits', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Education Credits</span>
                </label>
                <p className="text-sm text-gray-600">
                  American Opportunity or Lifetime Learning Credit
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasEITC}
                    onChange={(e) => handleInputChange('hasEITC', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Earned Income Tax Credit</span>
                </label>
                <p className="text-sm text-gray-600">
                  Credit for low to moderate income working individuals and families
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasHealthInsurance}
                    onChange={(e) => handleInputChange('hasHealthInsurance', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-medium text-gray-900">Health Insurance Coverage</span>
                </label>
                <p className="text-sm text-gray-600">
                  Had qualifying health coverage for the entire year
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
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