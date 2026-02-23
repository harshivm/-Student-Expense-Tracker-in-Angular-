import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  
  // Get budget alerts
  getBudgetAlerts(expenses: Expense[], budgets: any[]): any[] {
    const alerts: any[] = [];
    
    // Calculate spending by category
    const categorySpending = new Map<string, number>();
    
    expenses.forEach(exp => {
      if (exp.type === 'expense') {
        const current = categorySpending.get(exp.category) || 0;
        categorySpending.set(exp.category, current + exp.amount);
      }
    });
    
    // Check each budget
    budgets.forEach(budget => {
      const spent = categorySpending.get(budget.category) || 0;
      const percentage = (spent / budget.limit) * 100;
      
      if (percentage > 90) {
        alerts.push({
          type: 'danger',
          icon: '🔴',
          title: `${budget.category} Critical!`,
          message: `You've spent €${spent} of €${budget.limit} (${Math.round(percentage)}%)`,
          category: budget.category
        });
      } else if (percentage > 75) {
        alerts.push({
          type: 'warning',
          icon: '🟡',
          title: `${budget.category} Warning`,
          message: `You've spent €${spent} of €${budget.limit} (${Math.round(percentage)}%)`,
          category: budget.category
        });
      } else if (percentage < 30 && spent > 0) {
        alerts.push({
          type: 'success',
          icon: '✅',
          title: `${budget.category} on track`,
          message: `Great! You've only used ${Math.round(percentage)}% of your budget`,
          category: budget.category
        });
      }
    });
    
    return alerts;
  }
  
  // Get unusual expenses
  getUnusualExpenses(expenses: Expense[]): any[] {
    const unusual: any[] = [];
    
    // Group by category
    const categoryAmounts = new Map<string, number[]>();
    
    expenses.forEach(exp => {
      if (exp.type === 'expense') {
        if (!categoryAmounts.has(exp.category)) {
          categoryAmounts.set(exp.category, []);
        }
        categoryAmounts.get(exp.category)!.push(exp.amount);
      }
    });
    
    // Find unusual ones
    expenses.forEach(exp => {
      if (exp.type === 'expense') {
        const categoryValues = categoryAmounts.get(exp.category) || [];
        if (categoryValues.length > 1) {
          const sum = categoryValues.reduce((a, b) => a + b, 0);
          const avg = sum / categoryValues.length;
          
          if (exp.amount > avg * 1.8) {
            unusual.push({
              expense: exp,
              reason: `${Math.round((exp.amount/avg)*100)}% above normal`,
              normalAmount: Math.round(avg)
            });
          }
        }
      }
    });
    
    return unusual.slice(0, 3); // Show max 3
  }
  
  // Get next month prediction
  predictNextMonth(expenses: Expense[]): number {
    const today = new Date();
    const monthlyTotals: number[] = [];
    
    // Get last 3 months
    for (let i = 1; i <= 3; i++) {
      let monthTotal = 0;
      const targetMonth = today.getMonth() - i;
      const targetYear = today.getFullYear();
      
      expenses.forEach(exp => {
        if (exp.type === 'expense') {
          const expDate = new Date(exp.date);
          if (expDate.getMonth() === targetMonth && expDate.getFullYear() === targetYear) {
            monthTotal += exp.amount;
          }
        }
      });
      
      if (monthTotal > 0) {
        monthlyTotals.push(monthTotal);
      }
    }
    
    if (monthlyTotals.length === 0) return 0;
    
    const sum = monthlyTotals.reduce((a, b) => a + b, 0);
    return Math.round(sum / monthlyTotals.length);
  }
  
  // Get spending trend
  getSpendingTrend(expenses: Expense[]): string {
    const today = new Date();
    let thisMonth = 0;
    let lastMonth = 0;
    
    expenses.forEach(exp => {
      if (exp.type === 'expense') {
        const expDate = new Date(exp.date);
        if (expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear()) {
          thisMonth += exp.amount;
        } else if (expDate.getMonth() === today.getMonth() - 1 && expDate.getFullYear() === today.getFullYear()) {
          lastMonth += exp.amount;
        }
      }
    });
    
    if (lastMonth === 0) return "Not enough data";
    
    const diff = ((thisMonth - lastMonth) / lastMonth) * 100;
    
    if (diff > 5) return `📈 Up ${Math.round(diff)}% from last month`;
    if (diff < -5) return `📉 Down ${Math.abs(Math.round(diff))}% from last month`;
    return "➡️ Stable compared to last month";
  }
  
  // Get money saving tip
  getMoneyTip(): string {
    const tips = [
      "💰 Save 10% of your income first, spend later",
      "📱 Use student discounts whenever possible",
      "🍱 Meal prep to save on food",
      "🚶 Walk or bike instead of taking transport",
      "📚 Buy used textbooks instead of new ones",
      "☕ Make coffee at home, save €3/day = €90/month",
      "🎓 Many apps have student pricing - use it!",
      "💡 Turn off lights to save electricity",
      "🛒 Make a shopping list and stick to it",
      "🏦 Set up automatic savings transfer"
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  }
  
  // Get monthly summary
  getMonthlySummary(expenses: Expense[]): any {
    const today = new Date();
    let income = 0;
    let expense = 0;
    
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear()) {
        if (exp.type === 'income') {
          income += exp.amount;
        } else {
          expense += exp.amount;
        }
      }
    });
    
    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0
    };
  }
}