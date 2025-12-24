import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../models/expense.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-list',
  imports: [FormsModule, CommonModule], // Add this
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css',
})
export class ExpenseList {
  @Output() expenseDeleted = new EventEmitter<void>();
 
  
  expenses: Expense[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenses = this.expenseService.getExpenses();
  }

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.expenseService.deleteExpense(id);
      this.loadExpenses();
      this.expenseDeleted.emit();
    }
  }

  getCategoryColor(category: string): string {
    const categories = this.expenseService.getCategories();
    const cat = categories.find(c => c.name === category);
    return cat ? cat.color : '#999';
  }

}
