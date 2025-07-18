import React from 'react';
import { CheckCircle, AlertTriangle, DollarSign, Receipt, Building, Users, Calculator, FileText } from 'lucide-react';
import { useTaxData } from '../../contexts/TaxDataContext';

export const ReviewForm: React.FC = () => {
  const { taxData } = useTaxData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate totals
  const totalIncome = taxData.income.w2Income + 
                     taxData.income.freelanceIncome + 
                     taxData.income.interestIncome + 
                     taxData.income.dividendIncome + 
                     taxData.income.capitalGains + 
                     taxData.income.cryptoGains + 
                     taxData.income.rentalIncome;

  const totalItemizedDeductions = taxData.deductions.mortgageInterest + 
                                 Math.min(taxData.deductions.stateLocalTaxes, 10000) + 
                                 taxData.deductions.charitableDonations + 
                                 taxData.deductions.medicalExpenses;

  const standardDeduction = taxData.personalInfo.filingStatus === 'married-joint' ? 27700 : 13850;
  const deductionAmount = Math.max(totalItemizedDeductions, standardDeduction);
  const taxableIncome = Math.max(0, totalIncome - deductionAmount);

  // Simplified tax calculation
  const calculateTax = (income: number) => {
    let tax = 0;
    if (income > 578125) tax += (income - 578125) * 0.37;
    if (income > 231250) tax += Math.min(income - 231250, 578125 - 231250) * 0.35;
    if (income > 182050) tax += Math.min(income - 182050, 231250 - 182050) * 0.32;
    if (income > 95450) tax += Math.min(income - 95450, 182050 - 95450) * 0.24;
    if (income > 44725) tax += Math.min(income - 44725, 95450 - 44725) * 0.22;
    if (income > 11000) tax += Math.min(income - 11000, 44725 - 11000) * 0.12;
    if (income > 0) tax += Math.min(income, 11000) * 0.10;
    return Math.round(tax);
  };

  const federalTax = calculateTax(taxableIncome);
  const selfEmploymentTax = Math.round(taxData.income.freelanceIncome * 0.1413);
  const totalTax = federalTax + selfEmploymentTax;

  // Estimated withholding (simplified)
  const estimatedWithholding = Math.round(taxData.income.w2Income * 0.22);
  const refundOrOwed = estimatedWithholding - totalTax;

  const reviewSections = [
    {
      title: 'Personal Information',
      icon: Users,
      color: 'blue',
      items: [
        { label: 'Name', value: taxData.personalInfo.name },
        { label: 'Filing Status', value: taxData.personalInfo.filingStatus.replace('-', ' ') },
        { label: 'Dependents', value: taxData.personalInfo.dependents.toString() },
        { label: 'State', value: taxData.personalInfo.state }
      ]
    },
    {
      title: 'Income Summary',
      icon: DollarSign,
      color: 'green',
      items: [
        { label: 'W-2 Income', value: formatCurrency(taxData.income.w2Income) },
        { label: 'Freelance Income', value: formatCurrency(taxData.income.freelanceIncome) },
        { label: 'Investment Income', value: formatCurrency(taxData.income.interestIncome + taxData.income.dividendIncome) },
        { label: 'Capital Gains', value: formatCurrency(taxData.income.capitalGains) },
        { label: 'Crypto Gains', value: formatCurrency(taxData.income.cryptoGains) },
        { label: 'Total Income', value: formatCurrency(totalIncome), highlight: true }
      ]
    },
    {
      title: 'Deductions',
      icon: Receipt,
      color: 'purple',
      items: [
        { label: 'Mortgage Interest', value: formatCurrency(taxData.deductions.mortgageInterest) },
        { label: 'State & Local Taxes', value: formatCurrency(Math.min(taxData.deductions.stateLocalTaxes, 10000)) },
        { label: 'Charitable Donations', value: formatCurrency(taxData.deductions.charitableDonations) },
        { label: 'Medical Expenses', value: formatCurrency(taxData.deductions.medicalExpenses) },
        { label: 'Total Itemized', value: formatCurrency(totalItemizedDeductions) },
        { label: 'Standard Deduction', value: formatCurrency(standardDeduction) },
        { label: 'Deduction Used', value: formatCurrency(deductionAmount), highlight: true }
      ]
    },
    {
      title: 'Tax Calculation',
      icon: Calculator,
      color: 'orange',
      items: [
        { label: 'Total Income', value: formatCurrency(totalIncome) },
        { label: 'Less: Deductions', value: `(${formatCurrency(deductionAmount)})` },
        { label: 'Taxable Income', value: formatCurrency(taxableIncome), highlight: true },
        { label: 'Federal Income Tax', value: formatCurrency(federalTax) },
        { label: 'Self-Employment Tax', value: formatCurrency(selfEmploymentTax) },
        { label: 'Total Tax', value: formatCurrency(totalTax), highlight: true }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review Your Tax Return</h2>
                <p className="text-gray-600">Review all information before filing</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {refundOrOwed >= 0 ? 'Estimated Refund' : 'Estimated Amount Owed'}
              </div>
              <div className={`text-3xl font-bold ${refundOrOwed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(refundOrOwed))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Tax Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">INCOME</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</div>
              <div className="text-sm text-gray-600">Total Income</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Receipt className="w-6 h-6 text-purple-600" />
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">DEDUCTIONS</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(deductionAmount)}</div>
              <div className="text-sm text-gray-600">
                {totalItemizedDeductions > standardDeduction ? 'Itemized' : 'Standard'}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Calculator className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">TAX</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalTax)}</div>
              <div className="text-sm text-gray-600">Total Tax</div>
            </div>

            <div className={`${refundOrOwed >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-2">
                <FileText className={`w-6 h-6 ${refundOrOwed >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  refundOrOwed >= 0 
                    ? 'text-green-600 bg-green-100' 
                    : 'text-red-600 bg-red-100'
                }`}>
                  {refundOrOwed >= 0 ? 'REFUND' : 'OWED'}
                </span>
              </div>
              <div className={`text-2xl font-bold ${refundOrOwed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(refundOrOwed))}
              </div>
              <div className="text-sm text-gray-600">
                {refundOrOwed >= 0 ? 'Estimated Refund' : 'Amount Owed'}
              </div>
            </div>
          </div>

          {/* Detailed Review Sections */}
          <div className="space-y-8">
            {reviewSections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className={`bg-${section.color}-50 border-b border-gray-200 p-4`}>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <section.icon className={`w-5 h-5 mr-2 text-${section.color}-600`} />
                    {section.title}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className={`flex justify-between py-2 ${
                          item.highlight ? 'border-t border-gray-200 pt-3 font-semibold' : ''
                        }`}
                      >
                        <span className="text-gray-700">{item.label}:</span>
                        <span className={`${item.highlight ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• This is an estimate based on the information provided</li>
                  <li>• Actual tax calculations may vary based on additional factors</li>
                  <li>• Review all information carefully before filing</li>
                  <li>• Consider consulting a tax professional for complex situations</li>
                  {taxData.income.freelanceIncome > 0 && (
                    <li>• Self-employment tax and quarterly payments may be required</li>
                  )}
                  {taxData.income.cryptoGains > 0 && (
                    <li>• Cryptocurrency transactions require detailed reporting</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Make Changes
            </button>
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Approve & Continue to Filing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};