import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  
  private keywords = {
    'Food': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'lunch', 'dinner', 'food', 'groceries', 'supermarket'],
    'Transport': ['uber', 'taxi', 'bus', 'train', 'fuel', 'petrol', 'gas', 'parking'],
    'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'cinema'],
    'Shopping': ['amazon', 'clothes', 'shoes', 'mall', 'store', 'shopping'],
    'Bills': ['electricity', 'water', 'internet', 'phone', 'bill', 'rent'],
    'Health': ['doctor', 'medicine', 'pharmacy', 'gym', 'health']
  };
  
  suggestCategory(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    for (const [category, words] of Object.entries(this.keywords)) {
      for (const word of words) {
        if (lowerDesc.includes(word)) {
          return category;
        }
      }
    }
    
    return 'Other'; // Default
  }
  
  // Simple spending tips based on category
  getTip(category: string, amount: number): string {
    const tips = {
      'Food': 'Try meal prepping to save on food!',
      'Transport': 'Consider public transport to save money',
      'Entertainment': 'Look for student discounts',
      'Shopping': 'Wait 24h before buying non-essentials',
      'Bills': 'Turn off lights to save electricity',
      'Health': 'Prevention is cheaper than cure!',
      'Other': 'Track this expense for a week'
    };
    
    return tips[category as keyof typeof tips] || 'Keep up the good tracking!';
  }
}