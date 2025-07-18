export interface Transaction {
  id: string;
  type: 'stock' | 'crypto';
  symbol: string;
  action: 'buy' | 'sell';
  date: string;
  quantity: number;
  price: number;
  fees?: number;
  description?: string;
}

export interface CapitalGain {
  id: string;
  symbol: string;
  type: 'stock' | 'crypto';
  buyDate: string;
  sellDate: string;
  quantity: number;
  costBasis: number;
  saleProceeds: number;
  gainLoss: number;
  term: 'short' | 'long'; // < 1 year = short, >= 1 year = long
  fees: number;
}

export interface CapitalGainsSummary {
  shortTermGains: CapitalGain[];
  longTermGains: CapitalGain[];
  totalShortTermGainLoss: number;
  totalLongTermGainLoss: number;
  netCapitalGainLoss: number;
  taxImplications: {
    shortTermTaxRate: number;
    longTermTaxRate: number;
    estimatedTax: number;
  };
}

export class CapitalGainsCalculator {
  private static isLongTerm(buyDate: string, sellDate: string): boolean {
    const buy = new Date(buyDate);
    const sell = new Date(sellDate);
    const oneYearLater = new Date(buy);
    oneYearLater.setFullYear(buy.getFullYear() + 1);
    oneYearLater.setDate(buy.getDate() + 1); // Must hold for more than 1 year
    
    return sell >= oneYearLater;
  }

  private static matchTransactions(transactions: Transaction[]): CapitalGain[] {
    const gains: CapitalGain[] = [];
    const holdings: { [symbol: string]: Transaction[] } = {};

    // Group transactions by symbol
    transactions.forEach(transaction => {
      if (!holdings[transaction.symbol]) {
        holdings[transaction.symbol] = [];
      }
      holdings[transaction.symbol].push(transaction);
    });

    // Process each symbol using FIFO (First In, First Out)
    Object.entries(holdings).forEach(([symbol, symbolTransactions]) => {
      const buys = symbolTransactions
        .filter(t => t.action === 'buy')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const sells = symbolTransactions
        .filter(t => t.action === 'sell')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let buyIndex = 0;
      let remainingBuyQuantity = buys[0]?.quantity || 0;

      sells.forEach(sell => {
        let remainingSellQuantity = sell.quantity;

        while (remainingSellQuantity > 0 && buyIndex < buys.length) {
          const buy = buys[buyIndex];
          const matchedQuantity = Math.min(remainingSellQuantity, remainingBuyQuantity);

          if (matchedQuantity > 0) {
            const costBasis = (buy.price * matchedQuantity) + (buy.fees || 0) * (matchedQuantity / buy.quantity);
            const saleProceeds = (sell.price * matchedQuantity) - (sell.fees || 0) * (matchedQuantity / sell.quantity);
            const gainLoss = saleProceeds - costBasis;
            const term = this.isLongTerm(buy.date, sell.date) ? 'long' : 'short';

            gains.push({
              id: `${buy.id}-${sell.id}-${gains.length}`,
              symbol,
              type: buy.type,
              buyDate: buy.date,
              sellDate: sell.date,
              quantity: matchedQuantity,
              costBasis,
              saleProceeds,
              gainLoss,
              term,
              fees: ((buy.fees || 0) + (sell.fees || 0)) * (matchedQuantity / Math.max(buy.quantity, sell.quantity))
            });

            remainingSellQuantity -= matchedQuantity;
            remainingBuyQuantity -= matchedQuantity;

            if (remainingBuyQuantity === 0) {
              buyIndex++;
              remainingBuyQuantity = buys[buyIndex]?.quantity || 0;
            }
          }
        }
      });
    });

    return gains;
  }

  static calculateCapitalGains(transactions: Transaction[], taxBracket: number = 0.24): CapitalGainsSummary {
    const gains = this.matchTransactions(transactions);
    
    const shortTermGains = gains.filter(g => g.term === 'short');
    const longTermGains = gains.filter(g => g.term === 'long');
    
    const totalShortTermGainLoss = shortTermGains.reduce((sum, g) => sum + g.gainLoss, 0);
    const totalLongTermGainLoss = longTermGains.reduce((sum, g) => sum + g.gainLoss, 0);
    const netCapitalGainLoss = totalShortTermGainLoss + totalLongTermGainLoss;

    // Tax rate calculations (simplified)
    const shortTermTaxRate = taxBracket; // Taxed as ordinary income
    const longTermTaxRate = taxBracket <= 0.12 ? 0 : taxBracket <= 0.22 ? 0.15 : 0.20;
    
    const estimatedTax = Math.max(0, 
      (totalShortTermGainLoss > 0 ? totalShortTermGainLoss * shortTermTaxRate : 0) +
      (totalLongTermGainLoss > 0 ? totalLongTermGainLoss * longTermTaxRate : 0)
    );

    return {
      shortTermGains,
      longTermGains,
      totalShortTermGainLoss,
      totalLongTermGainLoss,
      netCapitalGainLoss,
      taxImplications: {
        shortTermTaxRate,
        longTermTaxRate,
        estimatedTax
      }
    };
  }

  static parseCSVTransactions(csvContent: string): Transaction[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const transaction: any = { id: `csv-${index}` };
      
      headers.forEach((header, i) => {
        const value = values[i];
        
        switch (header) {
          case 'symbol':
          case 'ticker':
            transaction.symbol = value.toUpperCase();
            break;
          case 'type':
            transaction.type = value.toLowerCase().includes('crypto') ? 'crypto' : 'stock';
            break;
          case 'action':
          case 'side':
            transaction.action = value.toLowerCase().includes('sell') ? 'sell' : 'buy';
            break;
          case 'date':
          case 'trade_date':
            transaction.date = value;
            break;
          case 'quantity':
          case 'shares':
          case 'amount':
            transaction.quantity = parseFloat(value) || 0;
            break;
          case 'price':
          case 'unit_price':
            transaction.price = parseFloat(value) || 0;
            break;
          case 'fees':
          case 'commission':
            transaction.fees = parseFloat(value) || 0;
            break;
          case 'description':
            transaction.description = value;
            break;
        }
      });
      
      return transaction as Transaction;
    }).filter(t => t.symbol && t.action && t.date && t.quantity && t.price);
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}