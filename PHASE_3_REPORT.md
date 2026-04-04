# Smart Student Expense & Budget Tracker

## Abstract

This project delivers a student-focused expense and budget tracking web application built with Angular and TypeScript. The system helps users record income and expenses, manage custom categories, monitor budget limits, and review financial trends through a reactive dashboard. Core features include local-storage persistence, category prediction from descriptions, budget alerts, spending analytics, and a responsive user interface designed for everyday mobile and desktop use. Phase 3 completes the main implementation scope and defines the validation plan for measuring usability, reliability, and accuracy.

## Introduction & Background

Students often manage irregular income, recurring bills, and day-to-day expenses with limited visibility into where money goes. Existing budgeting tools are frequently too broad, too complex, or not tailored to student spending patterns. This project addresses that gap by providing a lightweight financial tracker with simple data entry, categorized budgeting, and immediate feedback on spending behavior.

The application is designed around three goals: reduce friction when logging transactions, make spending patterns easy to understand, and support better financial decisions through actionable alerts and summaries. The current implementation uses Angular services, reactive state updates, and browser local storage to keep the solution simple while still maintaining a clear separation of concerns.

## Objectives

The project objectives for Phase 3 are:

1. Build a usable expense tracking workflow for income and expenses.
2. Provide category management so users can adapt the app to their own spending habits.
3. Track budget limits and show progress against each category.
4. Present analytics that summarize spending, trends, and monthly performance.
5. Persist user data locally so the app remains useful without a backend.
6. Add lightweight category prediction to reduce manual classification effort.
7. Support responsive usage across desktop and mobile screens.

## Methodology

The project follows an incremental implementation approach:

1. Requirements analysis was used to identify the main student finance tasks: transaction entry, category control, budget monitoring, and trend review.
2. System decomposition separated presentation components from reusable services and shared models.
3. Data flow was implemented with Angular services and RxJS BehaviorSubjects so that dashboard, budget, category, and transaction views stay synchronized.
4. Local persistence was added through browser local storage so that data remains available between sessions.
5. Prediction and alert logic were implemented as lightweight rule-based services to provide immediate guidance without external dependencies.
6. Testing was started with Angular unit tests, with additional coverage planned for services, data updates, and edge cases.

## Timeline & Milestones

The work is organized into practical milestones:

1. Phase 1: Problem definition, feature scoping, and interface planning.
2. Phase 2: Core structure, project setup, and initial system design.
3. Phase 3: Functional implementation of services, dashboard, budgeting, categories, analytics, and persistence.
4. Phase 4: Expanded testing, usability refinement, and validation against metrics.
5. Phase 5: Final documentation, polishing, and submission packaging.

## System Design & Architecture

The architecture is modular and centered on a shared expense service.

### Presentation Layer

The UI is split into reusable Angular components:

- Dashboard for overall status, charts, and summaries
- Add Expense for transaction input
- Expense List for transaction review and deletion
- Budget Overview for category-level progress
- Analytics for spending insights
- Category Manager for category customization
- Alert for budget and spending notifications

### Service Layer

The service layer implements the main business logic:

- ExpenseService manages expenses, budgets, categories, totals, and persistence
- CategoryService provides keyword-based category suggestions and practical tips
- CategoryPredictorService performs stronger transaction categorization using weighted keyword matching and confidence scoring
- AlertService generates spending trend summaries, budget warnings, and unusual expense checks

### Data Model

The shared model layer defines the main entities:

- Expense: id, amount, category, description, date, type
- Budget: category, limit, spent, color, icon
- Category: name, color, icon, default-state flag

### Data Flow

User actions update the service layer first. The services then publish the updated state through observables, and the components refresh automatically. This keeps the UI consistent without duplicating logic in multiple components.

### Implementation Highlights

- Local storage persistence keeps expenses, budgets, and categories available across sessions.
- Default categories and budgets provide a usable starting point for new users.
- Budget spending is recalculated whenever expenses are added or removed.
- The dashboard builds category totals and monthly summaries from live data.
- Charts provide visual feedback for category distribution, monthly cash flow, and long-term trends.

## Expected Challenges & Solutions

1. Data consistency across views
   - Solution: Use shared services with observable streams so all views update from a single source of truth.

2. Persistence without a backend
   - Solution: Store data in browser local storage and rebuild derived totals on load.

3. Category ambiguity in user-entered descriptions
   - Solution: Use keyword-based prediction with confidence scoring and allow manual category selection.

4. Keeping the interface responsive and readable
   - Solution: Use a mobile-friendly layout, compact visual summaries, and component-based styling.

5. Limited testing coverage in early phases
   - Solution: Expand tests from smoke checks to service behavior, budget updates, alert generation, and UI interactions.

## Metrics & Validation

Phase 3 should be evaluated with measurable criteria rather than only feature completion. The most relevant metrics are:

- Transaction entry success rate: percentage of valid entries saved correctly
- Budget accuracy: whether spending totals match the transaction history
- Persistence reliability: whether data survives reloads and browser restarts
- Category prediction usefulness: proportion of transactions assigned to a relevant category
- UI responsiveness: whether the dashboard remains usable on common desktop and mobile widths
- Test coverage growth: number of service and component behaviors covered by automated tests

Current testing is basic and confirms that the project compiles and core components initialize. The next step is to expand coverage around service logic, local-storage behavior, budget updates, and alert generation so the application can be validated more rigorously.

## Innovation

The project is more than a simple expense list because it combines several student-focused features in one workflow:

- Keyword-based category prediction reduces manual tagging effort.
- Budget progress indicators provide immediate financial feedback.
- Spending analytics turn transaction history into usable summaries.
- Local persistence avoids backend complexity while preserving practical functionality.
- A modular Angular design keeps the app maintainable and easy to extend.

## Conclusion

Phase 3 establishes the main working version of the Smart Student Expense & Budget Tracker. The application now has a clear modular architecture, persistent local data storage, budget awareness, category management, and dashboard analytics. The remaining work is primarily about strengthening analysis, expanding tests, and validating the system with defined metrics so the final submission demonstrates both functionality and engineering quality.