import { Component, ElementRef } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Analytics } from "../analytics/analytics";
import { ExpenseListComponent } from "../expense-list/expense-list";
import { BudgetOverview } from "../budget-overview/budget-overview";
import { AddExpense } from "../add-expense/add-expense";
import { CategoryManager } from '../category-manager/category-manager';
import { Subscription } from 'rxjs'; // Add this
import { Alert } from '../alert/alert';


// import { PullToRefresh } from "../pull-to-refresh/pull-to-refresh"; // Add this
@Component({
  selector: 'app-dashboard',
  imports: [ FormsModule, CommonModule, Alert, Analytics, ExpenseListComponent, BudgetOverview, AddExpense, CategoryManager],// Add this
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  totalExpenses: number = 0;
  totalIncome: number = 0;
  balance: number = 0;
  isLoading = false;
  lastUpdated = new Date();
  private totalsSubscription!: Subscription; // Add this
  
  constructor(
    private expenseService: ExpenseService,
    private elementRef: ElementRef
  ) {}
  

  ngOnInit(): void {
    this.updateTotals();

    this.totalsSubscription = this.expenseService.totals$.subscribe(totals => {
      this.totalIncome = totals.income;
      this.totalExpenses = totals.expenses;
      this.balance = totals.balance;
      console.log('Dashboard updated automatically!', totals);
    });

  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.totalsSubscription) {
      this.totalsSubscription.unsubscribe();
    }
  }

  

  // ngAfterViewInit(): void {
  //   this.preventBrowserPullToRefresh();
  // }

  updateTotals(): void {
    this.totalExpenses = this.expenseService.getTotalExpenses();
    this.totalIncome = this.expenseService.getTotalIncome();
    this.balance = this.expenseService.getBalance();
    this.lastUpdated = new Date();
  }

  // Handle pull-to-refresh event
  onPullToRefresh(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    // Simulate API call or data refresh
    setTimeout(() => {
      // In a real app, you would fetch fresh data from an API
      // For now, we'll just reload from localStorage
      this.updateTotals();
      
      // Show success message
      this.showSuccessMessage('Data refreshed successfully!');
      
      this.isLoading = false;
    }, 1000);
  }

  // Show success toast
  showSuccessMessage(message: string): void {
    // You can implement a toast service or use a simple alert
    console.log(message);
    
    // Optional: Create a simple toast notification
    const toast = document.createElement('div');
    toast.textContent = '✅ ' + message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #06D6A0, #4CAF50);
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 1000;
      font-weight: 600;
      animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  }

  // Prevent default browser pull-to-refresh
  private preventBrowserPullToRefresh(): void {
    const dashboardElement = this.elementRef.nativeElement.querySelector('.dashboard-container');
    
    if (dashboardElement) {
      dashboardElement.addEventListener('touchmove', (e: TouchEvent) => {
        if (dashboardElement.scrollTop === 0) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  }

  // Manual refresh button (optional)
  manualRefresh(): void {
    this.onPullToRefresh();
  }

  // Add this method to your Dashboard class
addSampleHistoricalData() {
  const today = new Date();
  
  // Create date for last month
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);
  
  console.log('📅 Adding expenses for last month:', lastMonth.toDateString());
  
  // Add last month expenses
  this.expenseService.addExpense({
    amount: 200,
    category: 'Food',
    description: 'Last month groceries',
    date: lastMonth,
    type: 'expense'
  });
  
  // Add another last month expense (different date)
  const lastMonthMid = new Date();
  lastMonthMid.setMonth(today.getMonth() - 1);
  lastMonthMid.setDate(15);
  
  this.expenseService.addExpense({
    amount: 150,
    category: 'Entertainment',
    description: 'Last month movie',
    date: lastMonthMid,
    type: 'expense'
  });
  
  // Add third last month expense
  const lastMonthEnd = new Date();
  lastMonthEnd.setMonth(today.getMonth() - 1);
  lastMonthEnd.setDate(25);
  
  this.expenseService.addExpense({
    amount: 100,
    category: 'Transport',
    description: 'Last month bus pass',
    date: lastMonthEnd,
    type: 'expense'
  });
  
  console.log('✅ Last month expenses added:');
  console.log('   - Food: €200');
  console.log('   - Entertainment: €150');
  console.log('   - Transport: €100');
  console.log('   Total last month: €450');
  
  // Check if they were added correctly
  setTimeout(() => {
    this.checkDates();
  }, 500);
}

// Add this helper method to verify
checkDates() {
  const expenses = this.expenseService.getExpenses();
  const today = new Date();
  let lastMonthTotal = 0;
  let thisMonthTotal = 0;
  
  console.log('\n📊 CURRENT EXPENSES BREAKDOWN:');
  console.log('--------------------------------');
  
  expenses.forEach((exp, index) => {
    const expDate = new Date(exp.date);
    const month = expDate.getMonth();
    const currentMonth = today.getMonth();
    
    if (month === currentMonth - 1) {
      lastMonthTotal += exp.amount;
      console.log(`✅ LAST MONTH: ${exp.description} - €${exp.amount}`);
    } else if (month === currentMonth) {
      thisMonthTotal += exp.amount;
      console.log(`📌 THIS MONTH: ${exp.description} - €${exp.amount}`);
    }
  });
  
  console.log('--------------------------------');
  console.log(`📈 This month total: €${thisMonthTotal}`);
  console.log(`📉 Last month total: €${lastMonthTotal}`);
  
  if (lastMonthTotal > 0 && thisMonthTotal > 0) {
    const diff = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    console.log(`📊 Trend: ${diff > 0 ? '📈 Up' : '📉 Down'} ${Math.abs(Math.round(diff))}%`);
  } else if (lastMonthTotal === 0) {
    console.log('⚠️ No last month data found!');
  }
}

// Add this method to your Dashboard class
addHistoricalData() {
  const today = new Date();
  
  // Create dates for last 3 months
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);
  
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(today.getMonth() - 2);
  
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  console.log('📅 Adding historical data...');
  
  // Add expenses for last 3 months
  const expenses = [
    // 3 months ago
    { amount: 320, category: 'Food', desc: 'Groceries', date: threeMonthsAgo },
    { amount: 80, category: 'Transport', desc: 'Bus pass', date: threeMonthsAgo },
    { amount: 150, category: 'Entertainment', desc: 'Movies', date: threeMonthsAgo },
    
    // 2 months ago
    { amount: 350, category: 'Food', desc: 'Groceries', date: twoMonthsAgo },
    { amount: 90, category: 'Transport', desc: 'Bus pass', date: twoMonthsAgo },
    { amount: 200, category: 'Entertainment', desc: 'Concert', date: twoMonthsAgo },
    
    // Last month
    { amount: 380, category: 'Food', desc: 'Groceries', date: lastMonth },
    { amount: 100, category: 'Transport', desc: 'Bus pass', date: lastMonth },
    { amount: 180, category: 'Entertainment', desc: 'Games', date: lastMonth },
    
    // This month (your existing expenses)
  ];
  
  expenses.forEach(exp => {
    this.expenseService.addExpense({
      amount: exp.amount,
      category: exp.category,
      description: exp.desc,
      date: exp.date,
      type: 'expense'
    });
  });
  
  console.log('✅ Historical data added!');
  console.log('📊 Months added:');
  console.log(`   - ${threeMonthsAgo.toLocaleDateString('default', { month: 'long', year: 'numeric' })}: €550`);
  console.log(`   - ${twoMonthsAgo.toLocaleDateString('default', { month: 'long', year: 'numeric' })}: €640`);
  console.log(`   - ${lastMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}: €660`);
  
  // Show what was added
  setTimeout(() => {
    this.checkMonthlyData();
  }, 500);
}

// Add this helper method to verify
checkMonthlyData() {
  const expenses = this.expenseService.getExpenses();
  const monthlyData = new Map();
  
  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!monthlyData.has(monthYear)) {
      monthlyData.set(monthYear, 0);
    }
    monthlyData.set(monthYear, monthlyData.get(monthYear) + exp.amount);
  });
  
  console.log('\n📊 EXPENSES BY MONTH:');
  console.log('---------------------');
  
  // Sort by date
  const sorted = Array.from(monthlyData.entries()).sort((a, b) => {
    const dateA = new Date(a[0]);
    const dateB = new Date(b[0]);
    return dateA.getTime() - dateB.getTime();
  });
  
  sorted.forEach(([month, total]) => {
    console.log(`${month}: €${total}`);
  });
  
  // Calculate prediction
  const totals = Array.from(monthlyData.values());
  if (totals.length >= 3) {
    const last3 = totals.slice(-3);
    const avg = Math.round(last3.reduce((a, b) => a + b, 0) / 3);
    console.log('\n🔮 Next month prediction: €' + avg);
  }
}

}

