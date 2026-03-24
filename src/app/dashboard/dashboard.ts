import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { AddExpense }           from '../add-expense/add-expense';
import { ExpenseListComponent } from '../expense-list/expense-list';
import { BudgetOverview }       from '../budget-overview/budget-overview';
import { Analytics }            from '../analytics/analytics';
import { CategoryManager }      from '../category-manager/category-manager';
import { Alert }                from '../alert/alert';

import { ExpenseService } from '../services/expense.service';
import { AlertService }   from '../services/alert.service';
import { Expense, Budget, Category } from '../models/expense.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AddExpense, ExpenseListComponent, BudgetOverview,
    Analytics, CategoryManager, Alert
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {

  activeTab: 'home' | 'add' | 'transactions' | 'budgets' | 'analytics' | 'alerts' | 'categories' = 'home';

  totalExpenses = 0;
  totalIncome   = 0;
  balance       = 0;
  savingsRate   = 0;

  expenses:       Expense[]  = [];
  budgets:        Budget[]   = [];
  categories:     Category[] = [];
  categoryTotals: { name: string; total: number; pct: number; color: string; icon: string }[] = [];
  monthlyData:    { month: string; income: number; expense: number }[] = [];

  trend           = '';
  nextMonth       = 0;
  monthlySummary: any = { income: 0, expense: 0, balance: 0, savingsRate: 0 };
  budgetAlerts:   any[] = [];
  unusualExpenses: any[] = [];
  animateIn = true;

  private subs: Subscription[] = [];
  private chartsDrawn = false;

  @ViewChild('pieCanvas')  pieCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas')  barCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  platformId = inject(PLATFORM_ID);

  constructor(
    private expenseService: ExpenseService,
    private alertService:   AlertService,
  ) {}

  ngOnInit(): void {
    this.refresh();

    if (isPlatformBrowser(this.platformId)) {
      this.subs.push(
        this.expenseService.expenses$.subscribe(() => {
          this.refresh();
          if (this.activeTab === 'home' && this.chartsDrawn) {
            setTimeout(() => this.drawAllCharts(), 50);
          }
        }),
        this.expenseService.totals$.subscribe(t => {
          this.totalIncome   = t.income;
          this.totalExpenses = t.expenses;
          this.balance       = t.balance;
          this.calcSavingsRate();
        })
      );
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.drawAllCharts();
          this.chartsDrawn = true;
        });
      });
    }
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  refresh(): void {
    this.expenses      = this.expenseService.getExpenses();
    this.budgets       = this.expenseService.getBudgets();
    this.categories    = this.expenseService.getCategories();
    this.totalIncome   = this.expenseService.getTotalIncome();
    this.totalExpenses = this.expenseService.getTotalExpenses();
    this.balance       = this.expenseService.getBalance();
    this.calcSavingsRate();
    this.buildCategoryTotals();
    this.buildMonthlyData();
    this.trend           = this.alertService.getSpendingTrend(this.expenses);
    this.nextMonth       = this.alertService.predictNextMonth(this.expenses);
    this.monthlySummary  = this.alertService.getMonthlySummary(this.expenses);
    this.budgetAlerts    = this.alertService.getBudgetAlerts(this.expenses, this.budgets);
    this.unusualExpenses = this.alertService.getUnusualExpenses(this.expenses);
  }

  calcSavingsRate(): void {
    this.savingsRate = this.totalIncome > 0
      ? Math.round(((this.totalIncome - this.totalExpenses) / this.totalIncome) * 100) : 0;
  }

  buildCategoryTotals(): void {
    const map = new Map<string, number>();
    this.expenses.filter(e => e.type === 'expense').forEach(e =>
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    this.categoryTotals = Array.from(map.entries()).map(([name, t]) => {
      const cat = this.categories.find(c => c.name === name);
      return { name, total: t, pct: total > 0 ? (t / total) * 100 : 0,
               color: cat?.color ?? '#999', icon: cat?.icon ?? '📦' };
    }).sort((a, b) => b.total - a.total);
  }

  buildMonthlyData(): void {
    const now = new Date();
    this.monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toLocaleString('default', { month: 'short' });
      let income = 0, expense = 0;
      this.expenses.forEach(e => {
        const ed = new Date(e.date);
        if (ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear())
          e.type === 'income' ? (income += e.amount) : (expense += e.amount);
      });
      this.monthlyData.push({ month, income, expense });
    }
  }

  setTab(t: typeof this.activeTab): void {
    this.activeTab = t;
    if (t === 'home') {
      this.animateIn = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.drawAllCharts();
        });
      });
    }
  }

  onExpenseAdded(): void { this.refresh(); this.setTab('home'); }

  getBudgetPct(b: Budget): number   { return Math.min((b.spent / b.limit) * 100, 100); }
  getBudgetColor(b: Budget): string {
    const p = (b.spent / b.limit) * 100;
    return p > 100 ? '#FF6B6B' : p > 80 ? '#FFD166' : '#06D6A0';
  }
  fmt(n: number): string { return `€${Math.abs(n).toFixed(2)}`; }

  get alertCount(): number {
    return this.budgetAlerts.filter((a: any) => a.type !== 'success').length
         + this.unusualExpenses.length;
  }

  drawAllCharts(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.drawPieChart();
    this.drawBarChart();
    this.drawLineChart();
  }

  drawPieChart(): void {
    const canvas = this.pieCanvas?.nativeElement;
    if (!canvas || !this.categoryTotals.length) return;
    const ctx = canvas.getContext('2d')!;

    // KEY FIX: Read the CSS-rendered size via getBoundingClientRect() which
    // always returns the actual pixel dimensions the browser painted,
    // regardless of whether the element was just inserted. Then force the
    // canvas BUFFER to the same square size so nothing gets stretched.
    const rect = canvas.getBoundingClientRect();
    const cssW  = rect.width  || 180;
    const cssH  = rect.height || 180;
    // Use the smaller side to guarantee a perfect square buffer
    const size  = Math.min(cssW, cssH) || 180;
    canvas.width  = size;
    canvas.height = size;
    const W = size, H = size;

    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const r  = size * 0.40;   // outer radius = 40% of square side
    const ri = r * 0.58;      // inner hole   = 58% of outer

    const total = this.categoryTotals.reduce((s, c) => s + c.total, 0);
    if (!total) return;

    let angle = -Math.PI / 2;
    this.categoryTotals.forEach(cat => {
      const slice = (cat.total / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle   = cat.color;
      ctx.fill();
      ctx.strokeStyle = '#0b1120';
      ctx.lineWidth   = 2.5;
      ctx.stroke();
      angle += slice;
    });

    // Punch out centre hole
    ctx.beginPath();
    ctx.arc(cx, cy, ri, 0, 2 * Math.PI);
    ctx.fillStyle = '#0b1120';
    ctx.fill();

    // Centre labels
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#f1f5f9';
    ctx.font = `bold ${Math.round(r * 0.22)}px DM Sans,sans-serif`;
    ctx.fillText(`€${total.toFixed(0)}`, cx, cy - 7);
    ctx.font      = `${Math.round(r * 0.13)}px DM Sans,sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('total spent', cx, cy + 12);
  }

  drawBarChart(): void {
    const canvas = this.barCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const parent = canvas.parentElement;
    const W = canvas.width  = parent?.clientWidth  || canvas.offsetWidth  || 460;
    const H = canvas.height = parent?.clientHeight || canvas.offsetHeight || 180;
    ctx.clearRect(0, 0, W, H);
    const pad = { t: 16, r: 16, b: 32, l: 44 };
    const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b, n = this.monthlyData.length;
    if (!n) return;
    const maxVal = Math.max(...this.monthlyData.flatMap(d => [d.income, d.expense]), 1);
    const slotW = cW / n, barW = slotW * 0.28, gap = slotW * 0.07;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + cH - (cH * i / 4);
      ctx.beginPath(); ctx.strokeStyle = 'rgba(148,163,184,0.1)'; ctx.lineWidth = 1;
      ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '9px DM Sans'; ctx.textAlign = 'right';
      ctx.fillText(`€${Math.round(maxVal * i / 4)}`, pad.l - 4, y + 3);
    }
    this.monthlyData.forEach((d, i) => {
      const x    = pad.l + slotW * i + gap * 2;
      const incH = (d.income  / maxVal) * cH;
      const expH = (d.expense / maxVal) * cH;
      const ig = ctx.createLinearGradient(0, pad.t + cH - incH, 0, pad.t + cH);
      ig.addColorStop(0, '#06D6A0'); ig.addColorStop(1, '#059669');
      ctx.fillStyle = ig; ctx.fillRect(x, pad.t + cH - incH, barW, incH);
      const eg = ctx.createLinearGradient(0, pad.t + cH - expH, 0, pad.t + cH);
      eg.addColorStop(0, '#FF6B6B'); eg.addColorStop(1, '#dc2626');
      ctx.fillStyle = eg; ctx.fillRect(x + barW + gap, pad.t + cH - expH, barW, expH);
      ctx.fillStyle = '#64748b'; ctx.font = '9px DM Sans'; ctx.textAlign = 'center';
      ctx.fillText(d.month, x + barW + gap / 2, H - pad.b + 12);
    });
    const lx = W - pad.r - 120;
    ctx.fillStyle = '#06D6A0'; ctx.fillRect(lx, 5, 8, 8);
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px DM Sans'; ctx.textAlign = 'left';
    ctx.fillText('Income', lx + 11, 12);
    ctx.fillStyle = '#FF6B6B'; ctx.fillRect(lx + 60, 5, 8, 8);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('Expense', lx + 71, 12);
  }

  drawLineChart(): void {
    const canvas = this.lineCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const parent = canvas.parentElement;
    const W = canvas.width  = parent?.clientWidth  || canvas.offsetWidth  || 460;
    const H = canvas.height = parent?.clientHeight || canvas.offsetHeight || 150;
    ctx.clearRect(0, 0, W, H);
    const pad = { t: 12, r: 16, b: 28, l: 44 };
    const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b, n = this.monthlyData.length;
    if (n < 2) return;
    const balances = this.monthlyData.map(d => d.income - d.expense);
    const maxV = Math.max(...balances.map(Math.abs), 1);
    const midY = pad.t + cH / 2;
    ctx.beginPath(); ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); ctx.moveTo(pad.l, midY); ctx.lineTo(W - pad.r, midY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#475569'; ctx.font = '9px DM Sans'; ctx.textAlign = 'right';
    ctx.fillText('€0', pad.l - 4, midY + 3);
    const pts = balances.map((b, i) => ({
      x: pad.l + (cW / (n - 1)) * i,
      y: midY - (b / maxV) * (cH / 2)
    }));
    ctx.beginPath(); ctx.moveTo(pts[0].x, midY);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, midY); ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
    grad.addColorStop(0, 'rgba(99,102,241,0.3)'); grad.addColorStop(1, 'rgba(99,102,241,0.02)');
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
    pts.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#6366f1'; ctx.fill();
      ctx.strokeStyle = '#0b1120'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px DM Sans'; ctx.textAlign = 'center';
      ctx.fillText(this.monthlyData[i].month, p.x, H - pad.b + 12);
    });
  }
}