import { Component, EventEmitter, Output } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Category } from '../models/expense.model';
import { FormsModule } from '@angular/forms'; // Add this
import { CommonModule } from '@angular/common'; // Add this



@Component({
  selector: 'app-add-expense',
  imports: [FormsModule, CommonModule], // Add this
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css',
})
export class AddExpense {
@Output() expenseAdded = new EventEmitter<void>();
  
  amount: number = 0;
  category: string = 'Food';
  description: string = '';
  type: 'expense' | 'income' = 'expense';
  
  categories: Category[] = [];

  constructor(private expenseService: ExpenseService) {
    this.categories = this.expenseService.getCategories();
  }

  onSubmit(): void {
    if (this.amount <= 0 || !this.description.trim()) {
      alert('Please fill all fields correctly');
      return;
    }

    this.expenseService.addExpense({
      amount: this.amount,
      category: this.category,
      description: this.description,
      date: new Date(),
      type: this.type
    });

    // Reset form
    this.amount = 0;
    this.description = '';
    this.category = 'Food';
    this.type = 'expense';
    
    // Notify parent
    this.expenseAdded.emit();
    
    alert('Transaction added successfully!');
  }

}
