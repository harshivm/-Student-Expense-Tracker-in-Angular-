import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Expense, Budget, Category } from '../models/expense.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses: Expense[] = [];
  private budgets: Budget[] = [
    { category: 'Food', limit: 300, spent: 0 },           // €300
    { category: 'Transport', limit: 100, spent: 0 },      // €100
    { category: 'Entertainment', limit: 150, spent: 0 },  // €150
    { category: 'Books', limit: 200, spent: 0 },          // €200
    { category: 'Other', limit: 100, spent: 0 }           // €100
  ];

  private categories: Category[] = [
    { name: 'Food', color: '#FF6B6B', icon: '🍔' },
    { name: 'Transport', color: '#4ECDC4', icon: '🚌' },
    { name: 'Entertainment', color: '#FFD166', icon: '🎬' },
    { name: 'Books', color: '#06D6A0', icon: '📚' },
    { name: 'Other', color: '#118AB2', icon: '📦' },
    { name: 'Income', color: '#073B4C', icon: '💰' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromLocalStorage();
  }

  getExpenses(): Expense[] {
    return [...this.expenses];
  }

  getBudgets(): Budget[] {
    return [...this.budgets];
  }

  getCategories(): Category[] {
    return [...this.categories];
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    
    this.expenses.push(newExpense);
    
    // Update budget if it's an expense
    if (expense.type === 'expense') {
      this.updateBudget(expense.category, expense.amount);
    }
    
    this.saveToLocalStorage();
  }

  deleteExpense(id: string): void {
    const index = this.expenses.findIndex(exp => exp.id === id);
    if (index !== -1) {
      const expense = this.expenses[index];
      // Remove from budget if it's an expense
      if (expense.type === 'expense') {
        this.updateBudget(expense.category, -expense.amount);
      }
      this.expenses.splice(index, 1);
      this.saveToLocalStorage();
    }
  }

  getTotalExpenses(): number {
    return this.expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getTotalIncome(): number {
    return this.expenses
      .filter(e => e.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  private updateBudget(category: string, amount: number): void {
    const budget = this.budgets.find(b => b.category === category);
    if (budget) {
      budget.spent += amount;
    }
  }

  private saveToLocalStorage(): void {
    // Only use localStorage if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }
  }

  private loadFromLocalStorage(): void {
    // Only use localStorage if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('expenses');
      if (stored) {
        this.expenses = JSON.parse(stored);
        // Recalculate budget spending
        this.budgets.forEach(budget => budget.spent = 0);
        this.expenses.forEach(expense => {
          if (expense.type === 'expense') {
            this.updateBudget(expense.category, expense.amount);
          }
        });
      }
    }
  }
}