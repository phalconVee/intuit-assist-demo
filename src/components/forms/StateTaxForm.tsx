import React, { useState } from 'react';
import { Building, MapPin, Calculator, Check, AlertCircle } from 'lucide-react';
import { useTaxData } from '../../contexts/TaxDataContext';

export const StateTaxForm: React.FC = () => {
  const { taxData, updateTaxData } = useTaxData();
  const [formData, setFormData] = useState({
    primaryState: taxData.personalInfo.state,
    hasMultipleStates: false,
    additionalStates: [] as string[],
    stateWithholding: 8500,
    estimatedPayments: 0,
    hasStateRefund: false,
    priorYearRefund: 0
  });

  const stateInfo = {
    'NY': { name: 'New York', rate: '4.0% - 10.9%', hasIncomeTax: true },
    'CA': { name: 'California', rate: '1.0% - 13.3%', hasIncomeTax: true },
    'FL': { name: 'Florida', rate: 'No state income tax', hasIncomeTax: false },
    'TX': { name: 'Texas', rate: 'No state income tax', hasIncomeTax: false },
    'WA': { name: 'Washington', rate: 'No state income tax', hasIncomeTax: false },
    'NV': { name: 'Nevada', rate: 'No state income tax', hasIncomeTax: false },
    'TN': { name: 'Tennessee', rate: 'No state income tax', hasIncomeTax: false },
    'NH': { name: 'New Hampshire', rate: 'Interest/dividends only', hasIncomeTax: false },
    'WY': { name: 'Wyoming', rate: 'No state income tax', hasIncomeTax: false }
  };

  const currentStateInfo = stateInfo[formData.primaryState as keyof typeof stateInfo] || 
    { name: formData.primaryState, rate: 'Varies', hasIncomeTax: true };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Update tax data context if needed
    updateTaxData({
      personalInfo: {
        ...taxData.personalInfo,
        state: formData.primaryState
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

  const estimatedStateTax = currentStateInfo.hasIncomeTax ? 
    Math.round(taxData.income.w2Income * 0.06) : 0; // Simplified calculation

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">State Taxes</h2>
                <p className="text-gray-600">State income tax filing and calculations</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Estimated State Tax</div>
              <div className="text-2xl font-bold text-indigo-600">
                {formatCurrency(estimatedStateTax)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Primary State */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
              Primary State of Residence
            </h3>

            <div className="bg-indigo-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={formData.primaryState}
                    onChange={(e) => handleInputChange('primaryState', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="NY">New York</option>
                    <option value="CA">California</option>
                    <option value="FL">Florida</option>
                    <option value="TX">Texas</option>
                    <option value="WA">Washington</option>
                    <option value="NV">Nevada</option>
                    <option value="TN">Tennessee</option>
                    <option value="NH">New Hampshire</option>
                    <option value="WY">Wyoming</option>
                  </select>
                </div>

                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-medium text-gray-900 mb-2">{currentStateInfo.name} Tax Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Rate:</span>
                      <span className="font-medium">{currentStateInfo.rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Income Tax:</span>
                      <span className={`font-medium ${currentStateInfo.hasIncomeTax ? 'text-red-600' : 'text-green-600'}`}>
                        {currentStateInfo.hasIncomeTax ? 'Required' : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {!currentStateInfo.hasIncomeTax && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="font-medium">No state income tax required!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {currentStateInfo.name} does not impose a state income tax on residents.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Multi-State Filing */}
          {currentStateInfo.hasIncomeTax && (
            <>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Multi-State Considerations</h3>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.hasMultipleStates}
                      onChange={(e) => handleInputChange('hasMultipleStates', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-900">I worked in multiple states</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Check this if you earned income in states other than your primary residence
                  </p>

                  {formData.hasMultipleStates && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center text-yellow-800 mb-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="font-medium">Multi-State Filing Required</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        You may need to file returns in multiple states. We'll help you determine which states require filing and calculate any credits for taxes paid to other states.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* State Withholding & Payments */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-indigo-600" />
                  State Tax Payments
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State Tax Withheld
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.stateWithholding || ''}
                        onChange={(e) => handleInputChange('stateWithholding', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Total state tax withheld from paychecks (from W-2)
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Tax Payments
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.estimatedPayments || ''}
                        onChange={(e) => handleInputChange('estimatedPayments', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Quarterly estimated tax payments made to the state
                    </p>
                  </div>
                </div>
              </div>

              {/* Prior Year State Refund */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Prior Year State Refund</h3>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.hasStateRefund}
                      onChange={(e) => handleInputChange('hasStateRefund', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-900">I received a state tax refund in 2023</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    State refunds may be taxable if you itemized deductions in the prior year
                  </p>

                  {formData.hasStateRefund && (
                    <div className="space-y-4">
                      <div className="relative max-w-md">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.priorYearRefund || ''}
                          onChange={(e) => handleInputChange('priorYearRefund', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Refund amount"
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          This refund may be taxable income if you itemized deductions and received a tax benefit from state tax deductions in the prior year.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Calculation Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">State Tax Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated State Tax Owed:</span>
                    <span className="font-medium">{formatCurrency(estimatedStateTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">State Tax Withheld:</span>
                    <span className="font-medium">{formatCurrency(formData.stateWithholding)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated Payments:</span>
                    <span className="font-medium">{formatCurrency(formData.estimatedPayments)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold">
                    <span>Estimated Refund/Owe:</span>
                    <span className={`${
                      (formData.stateWithholding + formData.estimatedPayments - estimatedStateTax) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(formData.stateWithholding + formData.estimatedPayments - estimatedStateTax) >= 0 ? 'Refund: ' : 'Owe: '}
                      {formatCurrency(Math.abs(formData.stateWithholding + formData.estimatedPayments - estimatedStateTax))}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
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