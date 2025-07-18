import React from 'react';
import { FileText, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { CapitalGainsSummary, CapitalGain, CapitalGainsCalculator } from '../services/capitalGainsCalculator';

interface ScheduleDFormProps {
  capitalGainsSummary: CapitalGainsSummary | null;
  className?: string;
}

export const ScheduleDForm: React.FC<ScheduleDFormProps> = ({ capitalGainsSummary, className = '' }) => {
  if (!capitalGainsSummary) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Schedule D - Capital Gains and Losses</h3>
        </div>
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Upload your investment statements to auto-populate Schedule D</p>
        </div>
      </div>
    );
  }

  const renderGainsTable = (gains: CapitalGain[], title: string, isShortTerm: boolean) => (
    <div className="mb-8">
      <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
        {isShortTerm ? (
          <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
        ) : (
          <TrendingDown className="w-5 h-5 text-green-500 mr-2" />
        )}
        {title}
      </h4>
      
      {gains.length === 0 ? (
        <div className="text-sm text-gray-500 italic">No transactions</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-700">Description</th>
                <th className="text-left p-3 font-medium text-gray-700">Date Acquired</th>
                <th className="text-left p-3 font-medium text-gray-700">Date Sold</th>
                <th className="text-right p-3 font-medium text-gray-700">Proceeds</th>
                <th className="text-right p-3 font-medium text-gray-700">Cost Basis</th>
                <th className="text-right p-3 font-medium text-gray-700">Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {gains.map((gain, index) => (
                <tr key={gain.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3">
                    <div className="font-medium">{gain.symbol}</div>
                    <div className="text-xs text-gray-500 capitalize">{gain.type} • {gain.quantity} shares</div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {CapitalGainsCalculator.formatDate(gain.buyDate)}
                  </td>
                  <td className="p-3 text-gray-600">
                    {CapitalGainsCalculator.formatDate(gain.sellDate)}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {CapitalGainsCalculator.formatCurrency(gain.saleProceeds)}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {CapitalGainsCalculator.formatCurrency(gain.costBasis)}
                  </td>
                  <td className={`p-3 text-right font-semibold ${
                    gain.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {gain.gainLoss >= 0 ? '+' : ''}{CapitalGainsCalculator.formatCurrency(gain.gainLoss)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Schedule D - Capital Gains and Losses</h3>
              <p className="text-sm text-gray-600">Auto-populated from your investment transactions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Net Capital Gain/Loss</div>
            <div className={`text-xl font-bold ${
              capitalGainsSummary.netCapitalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {capitalGainsSummary.netCapitalGainLoss >= 0 ? '+' : ''}
              {CapitalGainsCalculator.formatCurrency(capitalGainsSummary.netCapitalGainLoss)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-orange-800">Short-Term Gains/Losses</div>
                <div className="text-xs text-orange-600">Held &le; 1 year</div>
              </div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div className={`text-lg font-bold mt-2 ${
              capitalGainsSummary.totalShortTermGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {capitalGainsSummary.totalShortTermGainLoss >= 0 ? '+' : ''}
              {CapitalGainsCalculator.formatCurrency(capitalGainsSummary.totalShortTermGainLoss)}
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Tax Rate: {(capitalGainsSummary.taxImplications.shortTermTaxRate * 100).toFixed(0)}%
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-800">Long-Term Gains/Losses</div>
                <div className="text-xs text-green-600">Held &gt; 1 year</div>
              </div>
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <div className={`text-lg font-bold mt-2 ${
              capitalGainsSummary.totalLongTermGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {capitalGainsSummary.totalLongTermGainLoss >= 0 ? '+' : ''}
              {CapitalGainsCalculator.formatCurrency(capitalGainsSummary.totalLongTermGainLoss)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Tax Rate: {(capitalGainsSummary.taxImplications.longTermTaxRate * 100).toFixed(0)}%
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-800">Estimated Tax</div>
                <div className="text-xs text-blue-600">On capital gains</div>
              </div>
              <Calculator className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-blue-600 mt-2">
              {CapitalGainsCalculator.formatCurrency(capitalGainsSummary.taxImplications.estimatedTax)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Based on current tax brackets
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        {renderGainsTable(capitalGainsSummary.shortTermGains, 'Part I - Short-Term Capital Gains and Losses', true)}
        {renderGainsTable(capitalGainsSummary.longTermGains, 'Part II - Long-Term Capital Gains and Losses', false)}

        {/* Tax Strategy Notes */}
        {capitalGainsSummary.netCapitalGainLoss !== 0 && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-semibold text-yellow-800 mb-2">Tax Strategy Notes:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              {capitalGainsSummary.netCapitalGainLoss > 0 && (
                <li>• Consider tax-loss harvesting to offset gains</li>
              )}
              {capitalGainsSummary.netCapitalGainLoss < 0 && (
                <li>• You can deduct up to $3,000 in capital losses against ordinary income</li>
              )}
              {capitalGainsSummary.totalShortTermGainLoss > 0 && (
                <li>• Short-term gains are taxed as ordinary income - consider holding investments longer</li>
              )}
              <li>• Unused capital losses can be carried forward to future tax years</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};