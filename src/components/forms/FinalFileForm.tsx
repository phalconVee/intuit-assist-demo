import React, { useState } from 'react';
import { FileText, CreditCard, Ban as Bank, Shield, Check, AlertCircle, Download, Send } from 'lucide-react';
import { useTaxData } from '../../contexts/TaxDataContext';

export const FinalFileForm: React.FC = () => {
  const { taxData } = useTaxData();
  const [filingMethod, setFilingMethod] = useState<'efile' | 'mail'>('efile');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card' | 'check'>('bank');
  const [bankInfo, setBankInfo] = useState({
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking' as 'checking' | 'savings'
  });
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate final amounts (simplified)
  const totalIncome = taxData.income.w2Income + taxData.income.freelanceIncome + taxData.income.interestIncome + taxData.income.dividendIncome + taxData.income.capitalGains + taxData.income.cryptoGains;
  const estimatedTax = Math.round(totalIncome * 0.22);
  const estimatedWithholding = Math.round(taxData.income.w2Income * 0.22);
  const refundOrOwed = estimatedWithholding - estimatedTax;

  const handleFileReturn = () => {
    // Simulate filing process
    alert('Your tax return has been successfully filed!');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Final Review & File</h2>
                <p className="text-gray-600">Complete your tax return filing</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {refundOrOwed >= 0 ? 'Refund Amount' : 'Amount Owed'}
              </div>
              <div className={`text-3xl font-bold ${refundOrOwed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(refundOrOwed))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Filing Method */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Choose Filing Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  filingMethod === 'efile'
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFilingMethod('efile')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Send className="w-5 h-5 mr-2 text-green-600" />
                    E-File (Recommended)
                  </h4>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    filingMethod === 'efile' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {filingMethod === 'efile' && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Fastest processing (typically 21 days)</li>
                  <li>• Most secure and accurate</li>
                  <li>• Immediate confirmation</li>
                  <li>• Direct deposit available</li>
                </ul>
              </div>

              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  filingMethod === 'mail'
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFilingMethod('mail')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-gray-600" />
                    Print & Mail
                  </h4>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    filingMethod === 'mail' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {filingMethod === 'mail' && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Traditional paper filing</li>
                  <li>• 6-8 weeks processing time</li>
                  <li>• Must mail by deadline</li>
                  <li>• Paper check refund only</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment/Refund Method */}
          {filingMethod === 'efile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {refundOrOwed >= 0 ? 'Refund Method' : 'Payment Method'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Bank className="w-6 h-6 text-green-600" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'bank' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'bank' && <Check className="w-2 h-2 text-white" />}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                  <p className="text-xs text-gray-600">
                    {refundOrOwed >= 0 ? 'Direct deposit' : 'Direct debit'}
                  </p>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'card' && <Check className="w-2 h-2 text-white" />}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900">
                    {refundOrOwed >= 0 ? 'Prepaid Card' : 'Credit/Debit Card'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {refundOrOwed >= 0 ? 'Fees may apply' : 'Convenience fee applies'}
                  </p>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'check'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('check')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'check' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'check' && <Check className="w-2 h-2 text-white" />}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900">Paper Check</h4>
                  <p className="text-xs text-gray-600">
                    {refundOrOwed >= 0 ? 'Mailed to address' : 'Mail payment'}
                  </p>
                </div>
              </div>

              {/* Bank Information */}
              {paymentMethod === 'bank' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Bank Account Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={bankInfo.routingNumber}
                        onChange={(e) => setBankInfo(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="9-digit routing number"
                        maxLength={9}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={bankInfo.accountNumber}
                        onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Account number"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="checking"
                          checked={bankInfo.accountType === 'checking'}
                          onChange={(e) => setBankInfo(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                          className="mr-2"
                        />
                        Checking
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="savings"
                          checked={bankInfo.accountType === 'savings'}
                          onChange={(e) => setBankInfo(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                          className="mr-2"
                        />
                        Savings
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900">Security Notice</h5>
                        <p className="text-sm text-blue-800">
                          Your banking information is encrypted and secure. We use bank-level security to protect your data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Electronic Signature */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Electronic Signature</h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature Date
                  </label>
                  <input
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Taxpayer Declaration</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Under penalties of perjury, I declare that I have examined this return and accompanying schedules and statements, and to the best of my knowledge and belief, they are true, correct, and complete. Declaration of preparer (other than taxpayer) is based on all information of which preparer has any knowledge.
                  </p>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={agreementChecked}
                      onChange={(e) => setAgreementChecked(e.target.checked)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the terms and conditions above and authorize the electronic filing of my tax return.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Final Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Filing Summary</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Filing Method:</span>
                  <span className="font-medium">{filingMethod === 'efile' ? 'E-File' : 'Mail'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {refundOrOwed >= 0 ? 'Refund Method:' : 'Payment Method:'}
                  </span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">
                    {filingMethod === 'efile' ? '21 days' : '6-8 weeks'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Income:</span>
                  <span className="font-medium">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="font-medium">{formatCurrency(estimatedTax)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-green-300 pt-2">
                  <span className="text-gray-900">
                    {refundOrOwed >= 0 ? 'Refund:' : 'Amount Owed:'}
                  </span>
                  <span className={refundOrOwed >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(refundOrOwed))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* File Button */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={handleFileReturn}
              disabled={!agreementChecked || (paymentMethod === 'bank' && (!bankInfo.routingNumber || !bankInfo.accountNumber))}
              className="bg-green-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-3"
            >
              <Send className="w-6 h-6" />
              <span>File My Tax Return</span>
            </button>
          </div>

          {(!agreementChecked || (paymentMethod === 'bank' && (!bankInfo.routingNumber || !bankInfo.accountNumber))) && (
            <div className="flex items-center justify-center text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>Please complete all required fields and agreements to file your return</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};