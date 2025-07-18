import React from 'react';
import { FileText, Trash2, Clock, CheckCircle, AlertCircle, DollarSign, Building } from 'lucide-react';
import { TaxDocument } from '../services/mockApi';

interface DocumentListProps {
  documents: TaxDocument[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  className?: string;
}

const getStatusIcon = (status: TaxDocument['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'processing':
      return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusText = (status: TaxDocument['status']) => {
  switch (status) {
    case 'completed':
      return 'Processed';
    case 'processing':
      return 'Processing...';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  loading, 
  onDelete, 
  className = '' 
}) => {
  const [deletingIds, setDeletingIds] = React.useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return;
    
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      await onDelete(id);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
        <p className="text-gray-500">Upload your tax documents to get started with your return.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Tax Documents</h3>
        <p className="text-sm text-gray-500 mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
      </div>

      <div className="divide-y divide-gray-200">
        {documents.map((document) => (
          <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              {/* Document Thumbnail/Icon */}
              <div className="flex-shrink-0">
                {document.thumbnailUrl ? (
                  <img
                    src={document.thumbnailUrl}
                    alt={document.fileName}
                    className="w-12 h-12 rounded object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {document.fileName}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(document.status)}
                    <span className="text-xs text-gray-500">{getStatusText(document.status)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {document.type}
                  </span>
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                </div>

                {/* Document Details */}
                {document.status === 'completed' && (
                  <div className="flex items-center space-x-4 text-sm">
                    {document.employer && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{document.employer}</span>
                      </div>
                    )}
                    {document.amount && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(document.amount)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleDelete(document.id)}
                  disabled={deletingIds.has(document.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete document"
                >
                  {deletingIds.has(document.id) ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};