import { Injectable } from '@angular/core';

export interface CategoryPrediction {
  category: string;
  confidence: number;
  keywords: string[];
  color: string; // For UI display
}

@Injectable({
  providedIn: 'root'
})
export class CategoryPredictorService {
  
  // Define your categories with keywords and colors
  private categoriesConfig = [
    {
      name: 'Food & Dining',
      keywords: [
        'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'kfc', 'burger',
        'pizza', 'domino', 'subway', 'groceries', 'supermarket', 'aldi', 'lidl',
        'tesco', 'food', 'lunch', 'dinner', 'breakfast', 'bakery', 'baker'
      ],
      color: '#FF6B6B' // Red
    },
    {
      name: 'Transport',
      keywords: [
        'uber', 'bolt', 'taxi', 'train', 'rail', 'bus', 'metro', 'subway',
        'fuel', 'petrol', 'gas', 'parking', 'ticket', 'transport', 'commute',
        'flight', 'airport', 'trainstation'
      ],
      color: '#4ECDC4' // Teal
    },
    {
      name: 'Entertainment',
      keywords: [
        'netflix', 'spotify', 'youtube', 'disney', 'prime', 'cinema', 'movie',
        'concert', 'theatre', 'pub', 'bar', 'club', 'party', 'game', 'steam',
        'playstation', 'xbox', 'hobby', 'sports'
      ],
      color: '#FFD166' // Yellow
    },
    {
      name: 'Study & Education',
      keywords: [
        'amazon', 'book', 'textbook', 'library', 'university', 'college',
        'course', 'online', 'udemy', 'coursera', 'stationery', 'pen', 'paper',
        'printer', 'ink', 'software', 'license', 'student', 'tuition'
      ],
      color: '#06D6A0' // Green
    },
    {
      name: 'Shopping',
      keywords: [
        'shop', 'store', 'mall', 'clothes', 'fashion', 'zara', 'h&m',
        'nike', 'adidas', 'electronics', 'phone', 'laptop', 'accessory',
        'decoration', 'furniture', 'ikea', 'purchase', 'buy'
      ],
      color: '#118AB2' // Blue
    },
    {
      name: 'Healthcare',
      keywords: [
        'pharmacy', 'medicine', 'drug', 'clinic', 'doctor', 'hospital',
        'dental', 'optician', 'glasses', 'vitamin', 'supplement', 'health'
      ],
      color: '#9D4EDD' // Purple
    },
    {
      name: 'Utilities',
      keywords: [
        'electricity', 'water', 'gas', 'internet', 'wifi', 'mobile', 'phone',
        'bill', 'rent', 'housing', 'apartment', 'maintenance', 'repair'
      ],
      color: '#FF9E6D' // Orange
    }
  ];

  constructor() { }

  /**
   * Predict category based on transaction description
   */
  predictCategory(description: string): CategoryPrediction {
    const lowerDesc = description.toLowerCase().trim();
    
    // Check each category for keyword matches
    const matches = this.categoriesConfig.map(category => {
      const foundKeywords = category.keywords.filter(keyword => 
        lowerDesc.includes(keyword.toLowerCase())
      );
      
      return {
        category: category.name,
        confidence: this.calculateConfidence(foundKeywords.length, lowerDesc.length),
        keywords: foundKeywords,
        color: category.color
      };
    }).filter(prediction => prediction.keywords.length > 0);

    // If we have matches, return the best one
    if (matches.length > 0) {
      // Sort by number of keywords found (most matches first)
      matches.sort((a, b) => b.keywords.length - a.keywords.length);
      return matches[0];
    }

    // Default category if no matches
    return {
      category: 'Other',
      confidence: 0,
      keywords: [],
      color: '#6C757D' // Gray
    };
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(keywordCount: number, descriptionLength: number): number {
    if (keywordCount === 0) return 0;
    
    // Base score from keyword matches
    let score = Math.min(keywordCount * 25, 80);
    
    // Bonus if description is short (more precise)
    if (descriptionLength < 20) {
      score += 10;
    }
    
    // Bonus if multiple keywords found
    if (keywordCount >= 2) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Get all available categories for dropdown
   */
  getAllCategories(): { name: string; color: string }[] {
    return this.categoriesConfig.map(cat => ({
      name: cat.name,
      color: cat.color
    }));
  }

  /**
   * Get suggestions based on partial description
   */
  getSuggestions(partialDescription: string): string[] {
    const lowerPartial = partialDescription.toLowerCase();
    const suggestions = new Set<string>();
    
    this.categoriesConfig.forEach(category => {
      category.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowerPartial) && lowerPartial.length >= 2) {
          suggestions.add(keyword);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5); // Return max 5 suggestions
  }
}