# Smart Student Expense & Budget Tracker

A comprehensive Angular-based web application for students to manage their finances effectively.


### Financial Management
- Track income and expenses with categorization
- Set and monitor budget limits for different categories
- Real-time balance calculation
- Local storage for data persistence

### Analytics & Visualization
- Spending breakdown by category
- Budget progress tracking with visual indicators
- Financial summary dashboard
- Transaction history with filtering
- Adding and deleting the category according to user

### Modern UI/UX
- Clean, responsive design
- Gradient-based color scheme
- Interactive components
- Mobile-friendly interface

## Tech Stack

- **Frontend:** Angular 17+ with TypeScript
- **Styling:** CSS3 with modern features
- **State Management:** Angular Services
- **Data Persistence:** Browser LocalStorage
- **Build Tool:** Angular CLI
- **Testing:** Vitest with Angular TestBed

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **Git** (for cloning the repository)

Check your versions:
```bash
node --version
npm --version
```

## Installation

1. **Clone the Repository**
```bash
git clone https://github.com/harshivm/-Student-Expense-Tracker-in-Angular-.git
cd -Student-Expense-Tracker-in-Angular--main
```

2. **Install Dependencies**
```bash
npm install
```

This will install all required packages including Angular, TypeScript, and testing dependencies.

## Running the Application

### Development Server

Start the development server:
```bash
npm start
```

Or use the alternative command:
```bash
ng serve
```

- The application will be available at `http://localhost:4200`
- It will automatically reload when you modify source files
- Open your browser and navigate to the URL to see the app running

### Build for Production

Create a production build:
```bash
npm run build
```

Or use:
```bash
ng build --configuration production
```

The build output will be stored in the `dist/` directory.

### Run Tests

Execute the test suite:
```bash
npm test
```

Or use:
```bash
ng test --watch=false
```

This will run all unit tests and display the results in your terminal.

### Watch Mode for Development

Build in watch mode (automatically rebuilds on file changes):
```bash
npm run watch
```

Or use:
```bash
ng build --watch --configuration development
```

## Project Structure

```
src/
├── app/
│   ├── models/                 # TypeScript interfaces and models
│   │   └── expense.model.ts
│   ├── services/               # Angular services for business logic
│   │   ├── expense.service.ts
│   │   ├── category.service.ts
│   │   ├── alert.service.ts
│   │   ├── category-predictor.service.ts
│   │   └── prediction.service.ts
│   ├── components/             # Reusable components
│   │   ├── dashboard/
│   │   ├── expense-form/
│   │   ├── expense-list/
│   │   ├── add-expense/
│   │   ├── analytics/
│   │   ├── budget-overview/
│   │   ├── category-manager/
│   │   └── alert/
│   ├── app.ts                  # Main app component
│   └── app.routes.ts           # Route configuration
├── styles.css                  # Global styles
└── main.ts                     # Application entry point
```

## Usage Guide

1. **Open the Application**
   - Navigate to `http://localhost:4200` in your browser

2. **Dashboard**
   - View your financial overview and recent transactions
   - See budget status for each category

3. **Add Expense**
   - Click "Add Expense" to record a new transaction
   - Fill in amount, description, and category
   - The app will auto-predict the category based on your description

4. **View Expenses**
   - Browse all your transactions in the expense list
   - Delete transactions with undo capability (5-second window)

5. **Analytics**
   - Check spending breakdown by category
   - View budget utilization charts

6. **Manage Categories**
   - Create custom expense categories
   - Set budget limits for each category

## Troubleshooting

### Port Already in Use
If port 4200 is already in use:
```bash
ng serve --port 4300
```

### Dependencies Not Installing
Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Tests Failing
Ensure you're running in the project root directory:
```bash
cd -Student-Expense-Tracker-in-Angular--main
npm test
```

## Development Commands Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run watch` | Build in watch mode |
| `ng serve` | Alternative to `npm start` |
| `ng build` | Alternative to `npm run build` |
| `ng test` | Alternative to `npm test` |

## Contributing

1. Create a new feature branch
2. Make your changes
3. Run tests to ensure nothing breaks
4. Commit with descriptive messages
5. Push to your fork and create a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.
