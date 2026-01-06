
import { Transaction } from "@/contexts/transactions-context";
import { useBudget } from "@/contexts/budget-context";

type Budgets = ReturnType<typeof useBudget>['budgets'];

// Helper to format currency
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

// Main function to get a response
export function getBotResponse(
    query: string, 
    currentMonthTransactions: Transaction[], 
    previousMonthTransactions: Transaction[],
    budgets: Budgets
): string {
    const lowerQuery = query.toLowerCase();

    // --- Needs vs. Wants ---
    if (lowerQuery.includes('need') && lowerQuery.includes('want')) {
        const needsTotal = currentMonthTransactions
            .filter(t => t.type === 'expense' && t.spendingType === 'need')
            .reduce((sum, t) => sum + t.amount, 0);
        const wantsTotal = currentMonthTransactions
            .filter(t => t.type === 'expense' && t.spendingType === 'want')
            .reduce((sum, t) => sum + t.amount, 0);
        return `This month, you've spent ${formatCurrency(needsTotal)} on needs and ${formatCurrency(wantsTotal)} on wants.`;
    }

    // --- Largest Expense ---
    if (lowerQuery.includes('biggest') || lowerQuery.includes('largest') && lowerQuery.includes('expense')) {
        const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) {
            return "You don't have any expenses recorded for this month.";
        }
        const largestExpense = expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0]);
        return `Your largest expense this month was "${largestExpense.name}" for ${formatCurrency(largestExpense.amount)}.`;
    }

    // --- Average Daily Spend ---
    if (lowerQuery.includes('average') && lowerQuery.includes('daily')) {
        const totalExpense = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const daysInMonth = new Date().getDate(); // Get current day of the month
        const averageSpend = totalExpense / daysInMonth;
        return `Your average daily spending so far this month is ${formatCurrency(averageSpend)}.`;
    }
    
    // --- Comparison to last month ---
    if (lowerQuery.includes('compare') || lowerQuery.includes('last month')) {
        const categoryMatch = Object.keys(budgets).find(cat => lowerQuery.includes(cat));

        const currentTotal = (categoryMatch 
            ? currentMonthTransactions.filter(t => t.type === 'expense' && t.category.toLowerCase() === categoryMatch)
            : currentMonthTransactions.filter(t => t.type === 'expense')
        ).reduce((sum, t) => sum + t.amount, 0);

        const previousTotal = (categoryMatch
            ? previousMonthTransactions.filter(t => t.type === 'expense' && t.category.toLowerCase() === categoryMatch)
            : previousMonthTransactions.filter(t => t.type === 'expense')
        ).reduce((sum, t) => sum + t.amount, 0);

        const subject = categoryMatch ? `on ${categoryMatch}` : 'in total';
        
        if (previousTotal === 0) {
            return `You've spent ${formatCurrency(currentTotal)} ${subject} this month. There's no spending data from last month to compare it to.`;
        }

        const difference = currentTotal - previousTotal;
        const percentageChange = (difference / previousTotal) * 100;

        if (difference > 0) {
            return `You've spent ${formatCurrency(currentTotal)} ${subject} this month, which is ${percentageChange.toFixed(0)}% more than last month.`;
        } else if (difference < 0) {
            return `You've spent ${formatCurrency(currentTotal)} ${subject} this month, which is ${Math.abs(percentageChange).toFixed(0)}% less than last month. Good job!`;
        } else {
            return `Your spending ${subject} is exactly the same as last month: ${formatCurrency(currentTotal)}.`;
        }
    }


    // --- Spending Queries ---
    if (lowerQuery.includes('spend') || lowerQuery.includes('spent')) {
        // Total spending
        if (lowerQuery.includes('total') || lowerQuery.includes('how much')) {
            const totalExpense = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return `You have spent a total of ${formatCurrency(totalExpense)} this month.`;
        }
        // Spending by category
        const categoryMatch = Object.keys(budgets).find(cat => lowerQuery.includes(cat));
        if (categoryMatch) {
            const categoryExpense = currentMonthTransactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === categoryMatch)
                .reduce((sum, t) => sum + t.amount, 0);
            return `You have spent ${formatCurrency(categoryExpense)} on ${categoryMatch} this month.`;
        }
    }

    // --- Income Queries ---
    if (lowerQuery.includes('income') || lowerQuery.includes('earned') || lowerQuery.includes('made')) {
        const totalIncome = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        return `Your total income this month is ${formatCurrency(totalIncome)}.`;
    }
    
    // --- Budget Queries ---
    if (lowerQuery.includes('budget')) {
        // Check for "anything" or "any categories"
        if (lowerQuery.includes('anything') || lowerQuery.includes('any')) {
            const overspentCategories = Object.keys(budgets).filter(cat => {
                const budgetAmount = budgets[cat]?.amount || 0;
                const spent = currentMonthTransactions
                    .filter(t => t.type === 'expense' && t.category.toLowerCase() === cat)
                    .reduce((sum, t) => sum + t.amount, 0);
                return budgetAmount > 0 && spent > budgetAmount;
            });

            if (overspentCategories.length > 0) {
                return `Yes, you are over budget on: ${overspentCategories.join(', ')}.`;
            } else {
                return "No, you are within budget for all your categories. Great job!";
            }
        }
        
        const categoryMatch = Object.keys(budgets).find(cat => lowerQuery.includes(cat));
        if (categoryMatch) {
            const budgetAmount = budgets[categoryMatch]?.amount || 0;
            const categoryExpense = currentMonthTransactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === categoryMatch)
                .reduce((sum, t) => sum + t.amount, 0);
            
            if (budgetAmount === 0) {
                return `There's no budget set for ${categoryMatch}. You've spent ${formatCurrency(categoryExpense)} so far.`;
            }
            if (categoryExpense > budgetAmount) {
                return `You are ${formatCurrency(categoryExpense - budgetAmount)} over your budget for ${categoryMatch}.`;
            } else {
                return `You are under budget for ${categoryMatch}. You have ${formatCurrency(budgetAmount - categoryExpense)} remaining.`;
            }
        }
        const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b.amount, 0);
        return `Your total budget for this month is ${formatCurrency(totalBudget)}.`;
    }

    // --- Top spending categories ---
    if (lowerQuery.includes('top') && lowerQuery.includes('spending')) {
        const categoryTotals: { [key: string]: number } = {};
        currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
            
        if (sortedCategories.length === 0) {
            return "You have no spending data to analyze.";
        }

        const response = sortedCategories.map(([cat, amount], i) => `${i + 1}. ${cat}: ${formatCurrency(amount)}`).join('\\n');
        return `Your top ${sortedCategories.length} spending categories are:\\n${response}`;
    }
    
    // --- Savings Query ---
    if (lowerQuery.includes('savings') || lowerQuery.includes('saved')) {
         const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
         const totalExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
         return `You have saved ${formatCurrency(totalIncome - totalExpense)} this month.`;
    }

    // Fallback response
    return "I'm sorry, I can only answer questions about your income, spending, and budgets for the current month. Please try asking something like 'How much did I spend on food?' or 'What is my total income?'.";
}
