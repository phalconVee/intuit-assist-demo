import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { TaxDocument, UploadResponse } from '../services/mockApi';

interface DocumentUploaderProps {
  onUpload: (file: File, type: TaxDocument['type']) => Promise<UploadResponse>;
  className?: string;
}

const documentTypes: { value: TaxDocument['type']; label: string }[] = [
  { value: 'W-2', label: 'W-2 Form' },
  { value: '1099-MISC', label: '1099-MISC' },
  { value: '1099-INT', label: '1099-INT' },
  { value: '1099-DIV', label: '1099-DIV' },
  { value: 'CRYPTO', label: 'Crypto Tax Report' },
  { value: 'OTHER', label: 'Other Tax Document' }
];

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUpload, className = '' }) => {
  const [selectedType, setSelectedType] = useState<TaxDocument['type']>('W-2');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadStatus('error');
      setUploadMessage('Please upload a PDF file only.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File size must be less than 10MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadStatus('idle');
      setUploadMessage('');

      const response = await onUpload(file, selectedType);
      
      if (response.success) {
        setUploadStatus('success');
        setUploadMessage('Document uploaded successfully! Processing...');
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadStatus('error');
        setUploadMessage(response.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Upload className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Upload Tax Documents</h3>
      </div>

      <div className="space-y-4">
        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TaxDocument['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

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
            accept=".pdf"
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
                {uploading ? 'Uploading...' : 'Click to upload PDF'}
              </p>
              <p className="text-sm text-gray-500">
                {uploading ? 'Please wait while we process your document' : 'Maximum file size: 10MB'}
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

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Supported format: PDF only</p>
          <p>• Documents are automatically processed and data is extracted</p>
          <p>• Processing typically takes 1-2 minutes</p>
        </div>
      </div>
    </div>
  );
};