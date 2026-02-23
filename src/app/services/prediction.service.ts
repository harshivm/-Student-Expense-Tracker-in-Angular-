import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  
  // Simple Method 1: Predict next month based on last 3 months average
  predictNextMonth(expenses: Expense[]): number {
    const today = new Date();
    const last3Months: number[] = [];
    
    // Get last 3 months totals
    for (let i = 1; i <= 3; i++) {
      const month = today.getMonth() - i;
      const year = today.getFullYear();
      
      let monthlyTotal = 0;
      expenses.forEach(exp => {
        const expDate = new Date(exp.date);
        if (expDate.getMonth() === month && expDate.getFullYear() === year) {
          if (exp.type === 'expense') {
            monthlyTotal += exp.amount;
          }
        }
      });
      
      if (monthlyTotal > 0) {
        last3Months.push(monthlyTotal);
      }
    }
    
    // Calculate average of available months
    if (last3Months.length === 0) return 0;
    
    const sum = last3Months.reduce((a, b) => a + b, 0);
    return Math.round(sum / last3Months.length);
  }
  
  // Simple Method 2: Detect unusual expenses
  findUnusualExpenses(expenses: Expense[]): any[] {
    const unusual: any[] = [];
    
    // Group expenses by category
    const categoryMap = new Map();
    
    expenses.forEach(exp => {
      if (exp.type === 'expense') {
        if (!categoryMap.has(exp.category)) {
          categoryMap.set(exp.category, []);
        }
        categoryMap.get(exp.category).push(exp.amount);
      }
    });
    
    // Find expenses that are much higher than normal for that category
    categoryMap.forEach((amounts, category) => {
      // Calculate average for this category
      const sum = amounts.reduce((a: number, b: number) => a + b, 0);
      const avg = sum / amounts.length;
      
      // Find expenses > 2x average
      expenses.forEach(exp => {
        if (exp.category === category && exp.amount > avg * 2) {
          unusual.push({
            ...exp,
            reason: `This is ${Math.round((exp.amount/avg)*100)}% above your normal ${category} spending`,
            normalAmount: Math.round(avg)
          });
        }
      });
    });
    
    return unusual;
  }
  
  // Simple Method 3: Budget health check
  checkBudgetHealth(budget: any, spent: number): string {
    const percentage = (spent / budget.limit) * 100;
    
    if (percentage > 100) return "🔴 Over budget!";
    if (percentage > 80) return "🟡 Warning: Almost there";
    if (percentage > 50) return "🟢 On track";
    return "✅ Doing great!";
  }
  
  // Simple Method 4: Spending trend (up/down/same)
  getSpendingTrend(expenses: Expense[]): string {
    const today = new Date();
    let thisMonth = 0;
    let lastMonth = 0;
    
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (exp.type === 'expense') {
        if (expDate.getMonth() === today.getMonth()) {
          thisMonth += exp.amount;
        } else if (expDate.getMonth() === today.getMonth() - 1) {
          lastMonth += exp.amount;
        }
      }
    });
    
    if (thisMonth < lastMonth) return "📉 Spending decreased";
    if (thisMonth > lastMonth) return "📈 Spending increased";
    return "➡️ Spending stable";
  }
}