// Mock data types
export interface TaxDocument {
  id: string;
  type: 'W-2' | '1099-MISC' | '1099-INT' | '1099-DIV' | 'CRYPTO' | 'OTHER';
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  employer?: string;
  amount?: number;
  year: number;
  fileSize: number;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: string;
  isUser: boolean;
  type?: 'text' | 'suggestion' | 'document-reference';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  success: boolean;
  documentId?: string;
  error?: string;
  processingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
}

// Mock data
const mockTaxDocuments: TaxDocument[] = [
  {
    id: 'doc-1',
    type: 'W-2',
    fileName: 'W2_TechCorp_2023.pdf',
    uploadDate: '2024-01-15T10:30:00Z',
    status: 'completed',
    employer: 'TechCorp Inc.',
    amount: 85000,
    year: 2023,
    fileSize: 245760,
    thumbnailUrl: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=200&h=300'
  },
  {
    id: 'doc-2',
    type: '1099-MISC',
    fileName: '1099_FreelanceWork_2023.pdf',
    uploadDate: '2024-01-20T14:15:00Z',
    status: 'completed',
    employer: 'Freelance Client LLC',
    amount: 12500,
    year: 2023,
    fileSize: 156432,
    thumbnailUrl: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=200&h=300'
  },
  {
    id: 'doc-3',
    type: 'CRYPTO',
    fileName: 'Coinbase_Tax_Report_2023.pdf',
    uploadDate: '2024-02-01T09:45:00Z',
    status: 'processing',
    amount: 3250,
    year: 2023,
    fileSize: 892341,
    thumbnailUrl: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=200&h=300'
  },
  {
    id: 'doc-4',
    type: '1099-INT',
    fileName: 'Bank_Interest_2023.pdf',
    uploadDate: '2024-01-25T16:20:00Z',
    status: 'completed',
    employer: 'First National Bank',
    amount: 450,
    year: 2023,
    fileSize: 98765,
    thumbnailUrl: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=200&h=300'
  }
];

const mockChatSessions: ChatSession[] = [
  {
    id: 'chat-1',
    title: 'Remote Work Tax Questions',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    messages: [
      {
        id: 'msg-1',
        message: 'Is my remote income taxable in New York State?',
        timestamp: '2024-01-15T10:00:00Z',
        isUser: true,
        type: 'text'
      },
      {
        id: 'msg-2',
        message: 'Yes, if you\'re a New York resident, your income is generally taxable by New York State regardless of where you work. However, if you work remotely from another state, you may be eligible for tax credits to avoid double taxation.',
        timestamp: '2024-01-15T10:01:00Z',
        isUser: false,
        type: 'text'
      },
      {
        id: 'msg-3',
        message: 'What if I moved to Florida during the year?',
        timestamp: '2024-01-15T10:15:00Z',
        isUser: true,
        type: 'text'
      },
      {
        id: 'msg-4',
        message: 'If you moved from New York to Florida during the tax year, you\'ll need to file a part-year resident return in New York. You\'ll owe New York taxes on income earned while you were a resident, and Florida has no state income tax.',
        timestamp: '2024-01-15T10:16:00Z',
        isUser: false,
        type: 'text'
      }
    ]
  },
  {
    id: 'chat-2',
    title: 'Filing Deadline Questions',
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-02-01T14:15:00Z',
    messages: [
      {
        id: 'msg-5',
        message: 'What happens if I don\'t file my 2023 taxes?',
        timestamp: '2024-02-01T14:00:00Z',
        isUser: true,
        type: 'text'
      },
      {
        id: 'msg-6',
        message: 'If you don\'t file your 2023 taxes by the deadline (April 15, 2024), you may face penalties and interest charges. The failure-to-file penalty is typically 5% of unpaid taxes for each month or part of a month that your return is late, up to 25%.',
        timestamp: '2024-02-01T14:01:00Z',
        isUser: false,
        type: 'text'
      },
      {
        id: 'msg-7',
        message: 'Can I get an extension?',
        timestamp: '2024-02-01T14:10:00Z',
        isUser: true,
        type: 'text'
      },
      {
        id: 'msg-8',
        message: 'Yes! You can file Form 4868 to get an automatic 6-month extension to October 15, 2024. However, this only extends the filing deadline, not the payment deadline. You still need to pay any taxes owed by April 15 to avoid interest and penalties.',
        timestamp: '2024-02-01T14:11:00Z',
        isUser: false,
        type: 'text'
      }
    ]
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export class MockTaxApiService {
  // Document management
  static async getTaxDocuments(year?: number): Promise<TaxDocument[]> {
    await delay(800); // Simulate network delay
    
    if (year) {
      return mockTaxDocuments.filter(doc => doc.year === year);
    }
    return [...mockTaxDocuments];
  }

  static async getDocumentById(id: string): Promise<TaxDocument | null> {
    await delay(300);
    return mockTaxDocuments.find(doc => doc.id === id) || null;
  }

  static async uploadDocument(file: File, type: TaxDocument['type']): Promise<UploadResponse> {
    await delay(2000); // Simulate processing time
    
    // Simulate occasional upload failures
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: 'Upload failed. Please try again.',
        processingStatus: 'failed'
      };
    }

    const newDoc: TaxDocument = {
      id: `doc-${Date.now()}`,
      type,
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      status: 'processing',
      year: 2023,
      fileSize: file.size,
      thumbnailUrl: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=200&h=300'
    };

    mockTaxDocuments.push(newDoc);

    // Simulate processing completion after a delay
    setTimeout(() => {
      const doc = mockTaxDocuments.find(d => d.id === newDoc.id);
      if (doc) {
        doc.status = 'completed';
        // Simulate extracted data
        if (type === 'W-2') {
          doc.employer = 'Uploaded Employer';
          doc.amount = Math.floor(Math.random() * 100000) + 30000;
        }
      }
    }, 5000);

    return {
      success: true,
      documentId: newDoc.id,
      processingStatus: 'processing'
    };
  }

  static async deleteDocument(id: string): Promise<boolean> {
    await delay(500);
    const index = mockTaxDocuments.findIndex(doc => doc.id === id);
    if (index > -1) {
      mockTaxDocuments.splice(index, 1);
      return true;
    }
    return false;
  }

  // Chat functionality
  static async getChatSessions(): Promise<ChatSession[]> {
    await delay(600);
    return [...mockChatSessions].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static async getChatSession(id: string): Promise<ChatSession | null> {
    await delay(400);
    return mockChatSessions.find(session => session.id === id) || null;
  }

  static async sendMessage(sessionId: string, message: string): Promise<ChatMessage[]> {
    await delay(1200); // Simulate AI response time
    
    const session = mockChatSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      isUser: true,
      type: 'text'
    };

    session.messages.push(userMessage);

    // Generate AI response
    const aiResponse = this.generateAIResponse(message);
    const aiMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      message: aiResponse,
      timestamp: new Date(Date.now() + 1000).toISOString(),
      isUser: false,
      type: 'text'
    };

    session.messages.push(aiMessage);
    session.updatedAt = new Date().toISOString();

    return [userMessage, aiMessage];
  }

  static async createChatSession(initialMessage: string): Promise<ChatSession> {
    await delay(800);
    
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: initialMessage.length > 50 ? initialMessage.substring(0, 50) + '...' : initialMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    mockChatSessions.push(newSession);
    
    // Add initial messages
    await this.sendMessage(newSession.id, initialMessage);
    
    return newSession;
  }

  // AI response generation
  private static generateAIResponse(userMessage: string): string {
    const responses = [
      "Based on your tax situation, here's what I recommend...",
      "That's a great question! Let me help you understand this better.",
      "For your specific case, you'll want to consider these factors...",
      "I can help you with that. Here's what you need to know...",
      "This is a common question. The answer depends on your circumstances...",
      "Let me break this down for you step by step...",
      "According to current tax law, here's how this works...",
      "I'd be happy to clarify this for you. Here's the explanation..."
    ];

    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('deadline') || lowerMessage.includes('when')) {
      return "The tax filing deadline for 2023 returns is April 15, 2024. You can request an automatic extension until October 15, 2024, but any taxes owed are still due by April 15.";
    }
    
    if (lowerMessage.includes('deduction') || lowerMessage.includes('write off')) {
      return "There are many potential deductions available. Common ones include mortgage interest, charitable donations, state and local taxes (up to $10,000), and business expenses if you're self-employed.";
    }
    
    if (lowerMessage.includes('crypto') || lowerMessage.includes('bitcoin')) {
      return "Cryptocurrency transactions are taxable events. You'll need to report gains and losses from crypto sales, trades, and mining. Make sure to keep detailed records of all transactions.";
    }
    
    if (lowerMessage.includes('refund')) {
      return "Your refund amount depends on how much tax was withheld versus what you actually owe. If you had too much withheld, you'll get a refund. The IRS typically processes refunds within 21 days of acceptance.";
    }

    // Return a random generic response
    return responses[Math.floor(Math.random() * responses.length)] + " " + 
           "If you need more specific guidance, I can help you explore the details of your particular situation.";
  }

  // Tax calculation helpers
  static async calculateEstimatedTax(income: number, deductions: number): Promise<number> {
    await delay(1000);
    
    // Simplified tax calculation (not accurate for real use)
    const taxableIncome = Math.max(0, income - deductions);
    let tax = 0;
    
    // 2023 tax brackets (simplified)
    if (taxableIncome > 578125) tax += (taxableIncome - 578125) * 0.37;
    if (taxableIncome > 231250) tax += Math.min(taxableIncome - 231250, 578125 - 231250) * 0.35;
    if (taxableIncome > 182050) tax += Math.min(taxableIncome - 182050, 231250 - 182050) * 0.32;
    if (taxableIncome > 95450) tax += Math.min(taxableIncome - 95450, 182050 - 95450) * 0.24;
    if (taxableIncome > 44725) tax += Math.min(taxableIncome - 44725, 95450 - 44725) * 0.22;
    if (taxableIncome > 11000) tax += Math.min(taxableIncome - 11000, 44725 - 11000) * 0.12;
    if (taxableIncome > 0) tax += Math.min(taxableIncome, 11000) * 0.10;
    
    return Math.round(tax);
  }

  // Document processing status
  static async getProcessingStatus(documentId: string): Promise<TaxDocument['status']> {
    await delay(200);
    const doc = mockTaxDocuments.find(d => d.id === documentId);
    return doc?.status || 'error';
  }
}