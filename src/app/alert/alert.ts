import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { PredictionService } from '../services/prediction.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../services/alert.service';
@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
  

})
export class Alert implements OnInit {
  budgetAlerts: any[] = [];
  unusualExpenses: any[] = [];
  monthlySummary: any = { income: 0, expense: 0, balance: 0, savingsRate: 0 };
  nextMonthPrediction: number = 0;
  trend: string = '';
  moneyTip: string = '';

  constructor(
    private expenseService: ExpenseService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadAlerts();
    
    // Subscribe to changes
    this.expenseService.expenses$.subscribe(() => {
      this.loadAlerts();
    });
  }

  loadAlerts() {
    const expenses = this.expenseService.getExpenses();
    const budgets = this.expenseService.getBudgets();
    
    this.budgetAlerts = this.alertService.getBudgetAlerts(expenses, budgets);
    this.unusualExpenses = this.alertService.getUnusualExpenses(expenses);
    this.monthlySummary = this.alertService.getMonthlySummary(expenses);
    this.nextMonthPrediction = this.alertService.predictNextMonth(expenses);
    this.trend = this.alertService.getSpendingTrend(expenses);
    this.moneyTip = this.alertService.getMoneyTip();
  }
  // Add this method temporarily
  checkDates() {
    const expenses = this.expenseService.getExpenses();
    console.log('=== ALL EXPENSES ===');
    expenses.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.description}:`);
      console.log('   Date object:', exp.date);
      console.log('   Month:', new Date(exp.date).getMonth());
      console.log('   Current month:', new Date().getMonth());
      console.log('   Is last month?', new Date(exp.date).getMonth() === new Date().getMonth() - 1);
    });
  }
}