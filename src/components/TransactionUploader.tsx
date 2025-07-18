import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader, Download, TrendingUp } from 'lucide-react';
import { Transaction, CapitalGainsCalculator, CapitalGainsSummary } from '../services/capitalGainsCalculator';

interface TransactionUploaderProps {
  onTransactionsProcessed: (summary: CapitalGainsSummary, transactions: Transaction[]) => void;
  className?: string;
}

export const TransactionUploader: React.FC<TransactionUploaderProps> = ({ 
  onTransactionsProcessed, 
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCSV = `symbol,type,action,date,quantity,price,fees,description
AAPL,stock,buy,2023-01-15,100,150.25,9.99,Apple Inc
AAPL,stock,sell,2023-06-20,50,180.75,9.99,Apple Inc
TSLA,stock,buy,2023-02-10,25,200.50,9.99,Tesla Inc
TSLA,stock,sell,2023-11-15,25,240.25,9.99,Tesla Inc
BTC,crypto,buy,2023-03-01,0.5,25000,25,Bitcoin
BTC,crypto,sell,2023-08-15,0.25,30000,30,Bitcoin
MSFT,stock,buy,2022-12-01,75,250.00,9.99,Microsoft Corp
MSFT,stock,sell,2023-09-10,75,320.50,9.99,Microsoft Corp`;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('error');
      setUploadMessage('Please upload a CSV file only.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File size must be less than 5MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadStatus('idle');
      setUploadMessage('');

      // Read file content
      const fileContent = await file.text();
      
      // Parse transactions
      const parsedTransactions = CapitalGainsCalculator.parseCSVTransactions(fileContent);
      
      if (parsedTransactions.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No valid transactions found in the file. Please check the format.');
        return;
      }

      // Calculate capital gains
      const summary = CapitalGainsCalculator.calculateCapitalGains(parsedTransactions);
      
      setTransactions(parsedTransactions);
      setUploadStatus('success');
      setUploadMessage(`Successfully processed ${parsedTransactions.length} transactions!`);
      
      // Notify parent component
      onTransactionsProcessed(summary, parsedTransactions);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : 'Failed to process file. Please check the format.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Upload Investment Transactions</h3>
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        <div
          onClick={handleUploadClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center space-y-3">
            {uploading ? (
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            ) : (
              <FileText className="w-12 h-12 text-gray-400" />
            )}
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Processing transactions...' : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-gray-500">
                {uploading ? 'Calculating capital gains and losses' : 'Maximum file size: 5MB'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {uploadStatus !== 'idle' && (
          <div className={`flex items-center space-x-2 p-3 rounded-md ${
            uploadStatus === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {uploadStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{uploadMessage}</span>
          </div>
        )}

        {/* Sample CSV Download */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Need a template?</h4>
              <p className="text-xs text-gray-600">Download a sample CSV file with the correct format</p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Sample CSV</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Required columns:</strong> symbol, type, action, date, quantity, price</p>
          <p><strong>Optional columns:</strong> fees, description</p>
          <p><strong>Supported formats:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• Type: "stock" or "crypto"</li>
            <li>• Action: "buy" or "sell"</li>
            <li>• Date: YYYY-MM-DD format</li>
            <li>• Quantity: Number of shares/units</li>
            <li>• Price: Price per share/unit</li>
          </ul>
        </div>

        {/* Transaction Summary */}
        {transactions.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Processed Transactions</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Transactions:</span>
                <span className="ml-2 font-medium">{transactions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Unique Symbols:</span>
                <span className="ml-2 font-medium">
                  {new Set(transactions.map(t => t.symbol)).size}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};