import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';

// Models
interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  predictedCategory?: string;
  confidence?: number;
  date: Date;
  notes?: string;
}

interface CategoryPrediction {
  category: string;
  confidence: number;
  keywords: string[];
  color: string;
}

// Mock Services (Create these in separate files later)
class CategoryPredictorService {
  private categoriesConfig = [
    {
      name: 'Food & Dining',
      keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'food', 'lunch', 'dinner'],
      color: '#FF6B6B'
    },
    {
      name: 'Transport',
      keywords: ['uber', 'taxi', 'train', 'bus', 'fuel', 'transport'],
      color: '#4ECDC4'
    },
    {
      name: 'Entertainment',
      keywords: ['netflix', 'spotify', 'cinema', 'movie', 'concert'],
      color: '#FFD166'
    },
    {
      name: 'Study & Education',
      keywords: ['amazon', 'book', 'textbook', 'library', 'course'],
      color: '#06D6A0'
    }
  ];

  predictCategory(description: string): CategoryPrediction {
    const lowerDesc = description.toLowerCase().trim();
    let bestMatch = { category: 'Other', confidence: 0, keywords: [] as string[], color: '#6C757D' };
    
    for (const category of this.categoriesConfig) {
      const foundKeywords = category.keywords.filter(keyword => 
        lowerDesc.includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length > 0) {
        const confidence = Math.min(foundKeywords.length * 30, 100);
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            category: category.name,
            confidence,
            keywords: foundKeywords,
            color: category.color
          };
        }
      }
    }
    
    return bestMatch;
  }

  getAllCategories() {
    return this.categoriesConfig.map(cat => ({ name: cat.name, color: cat.color }));
  }

  getSuggestions(description: string): string[] {
    const lowerDesc = description.toLowerCase();
    const suggestions = new Set<string>();
    
    this.categoriesConfig.forEach(category => {
      category.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowerDesc) && lowerDesc.length >= 2) {
          suggestions.add(keyword);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5);
  }
}

class ExpenseService {
  addExpense(expense: Expense): Observable<Expense> {
    // Simulate API call
    console.log('Saving expense:', expense);
    
    const newExpense = {
      ...expense,
      id: Date.now().toString()
    };
    
    return of(newExpense); // Returns Observable
  }
}

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-form.html',
  styleUrls: ['./expense-form.css']
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  categories: { name: string; color: string }[] = [];
  suggestedKeywords: string[] = [];
  predictedCategory: CategoryPrediction = {
    category: '',
    confidence: 0,
    keywords: [],
    color: '#6C757D'
  };
  showPrediction: boolean = false;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  
  private categoryPredictor = new CategoryPredictorService();
  private expenseService = new ExpenseService();

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.categories = this.categoryPredictor.getAllCategories();
    
    this.expenseForm.get('description')?.valueChanges.subscribe((value: string) => {
      this.onDescriptionChange(value);
    });
  }

  onDescriptionChange(description: string): void {
    if (description && description.length >= 2) {
      this.suggestedKeywords = this.categoryPredictor.getSuggestions(description);
      
      const prediction = this.categoryPredictor.predictCategory(description);
      this.predictedCategory = prediction;
      this.showPrediction = prediction.confidence > 20;
      
      if (prediction.confidence > 70) {
        this.expenseForm.patchValue({
          category: prediction.category
        }, { emitEvent: false });
      }
    } else {
      this.suggestedKeywords = [];
      this.showPrediction = false;
    }
  }

  usePrediction(): void {
    if (this.predictedCategory.confidence > 0) {
      this.expenseForm.patchValue({
        category: this.predictedCategory.category
      });
    }
  }

  useSuggestion(suggestion: string): void {
    const currentDesc = this.expenseForm.get('description')?.value || '';
    this.expenseForm.patchValue({
      description: currentDesc + ' ' + suggestion
    });
  }
  
  // Helper getters for template
  get predictionConfidence(): number {
    return this.predictedCategory.confidence;
  }
  
  get predictedCategoryName(): string {
    return this.predictedCategory.category;
  }
  
  get predictionColor(): string {
    return this.predictedCategory.color;
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      
      const prediction = this.categoryPredictor.predictCategory(formValue.description);
      
      const expense: Expense = {
        amount: formValue.amount,
        description: formValue.description,
        category: formValue.category,
        predictedCategory: prediction.category,
        confidence: prediction.confidence,
        date: new Date(formValue.date),
        notes: formValue.notes
      };
      
      this.expenseService.addExpense(expense).subscribe({
        next: (response: Expense) => {
          // Show success message
          this.showSuccessMessage = true;
          this.successMessage = `Successfully added €${response.amount} for ${response.description}`;
          
          console.log('Expense added:', response);
          
          // Reset the form completely
          this.resetForm();
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: (error: any) => {
          console.error('Error:', error);
          // Show error message
          this.showSuccessMessage = true;
          this.successMessage = 'Error adding expense. Please try again.';
          this.showSuccessMessage = true; // Use same UI for error
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.expenseForm.controls).forEach(key => {
        const control = this.expenseForm.get(key);
        control?.markAsTouched();
      });
      
      // Show validation error message
      this.showSuccessMessage = true;
      this.successMessage = 'Please fill all required fields correctly.';
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }

  // New method to properly reset the form
  private resetForm(): void {
    // Reset form with default values
    this.expenseForm.reset({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    
    // Reset prediction state
    this.showPrediction = false;
    this.suggestedKeywords = [];
    this.predictedCategory = {
      category: '',
      confidence: 0,
      keywords: [],
      color: '#6C757D'
    };
    
    // Reset form validation state
    this.expenseForm.markAsPristine();
    this.expenseForm.markAsUntouched();
    
    // Focus back to first input for better UX
    setTimeout(() => {
      const firstInput = document.getElementById('amount') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  // Close success message manually
  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
  }
}