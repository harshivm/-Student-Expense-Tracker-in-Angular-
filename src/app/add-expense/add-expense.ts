import { Component, EventEmitter, Output } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Category } from '../models/expense.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-expense',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css',
})
export class AddExpense {
  @Output() expenseAdded = new EventEmitter<void>();
  
  amount: number = 0;
  category: string = 'Food';
  description: string = '';
  type: 'expense' | 'income' = 'expense';
  date: string = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  
  categories: Category[] = [];

  constructor(private expenseService: ExpenseService) {
    this.categories = this.expenseService.getCategories();
  }

  onSubmit(): void {
    if (this.amount <= 0 || !this.description.trim() || !this.date) {
      alert('Please fill all fields correctly');
      return;
    }

    // Convert the date string to a Date object
    const selectedDate = new Date(this.date);
    
    // Check if date is valid
    if (isNaN(selectedDate.getTime())) {
      alert('Please select a valid date');
      return;
    }

    this.expenseService.addExpense({
      amount: this.amount,
      category: this.category,
      description: this.description,
      date: selectedDate, // Use the selected date
      type: this.type
    });

    // Reset form
    this.amount = 0;
    this.description = '';
    this.category = 'Food';
    this.type = 'expense';
    this.date = new Date().toISOString().split('T')[0]; // Reset to today
    
    // Notify parent
    this.expenseAdded.emit();
    
    alert('Transaction added successfully!');
  }
}