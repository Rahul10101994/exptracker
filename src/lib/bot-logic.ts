
import { Transaction } from "@/contexts/transactions-context";
import { useBudget } from "@/contexts/budget-context";

type Budgets = ReturnType<typeof useBudget>['budgets'];

// Helper to format currency
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

// Main function to get a response
export function getBotResponse(query: string, transactions: Transaction[], budgets: Budgets): string {
    const lowerQuery = query.toLowerCase();

    // --- Spending Queries ---
    if (lowerQuery.includes('spend') || lowerQuery.includes('spent')) {
        // Total spending
        if (lowerQuery.includes('total') || lowerQuery.includes('how much')) {
            const totalExpense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return `You have spent a total of ${formatCurrency(totalExpense)} this month.`;
        }
        // Spending by category
        const categoryMatch = Object.keys(budgets).find(cat => lowerQuery.includes(cat));
        if (categoryMatch) {
            const categoryExpense = transactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === categoryMatch)
                .reduce((sum, t) => sum + t.amount, 0);
            return `You have spent ${formatCurrency(categoryExpense)} on ${categoryMatch} this month.`;
        }
    }

    // --- Income Queries ---
    if (lowerQuery.includes('income') || lowerQuery.includes('earned') || lowerQuery.includes('made')) {
        const totalIncome = transactions
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
                const spent = transactions
                    .filter(t => t.type === 'expense' && t.category.toLowerCase() === cat)
                    .reduce((sum, t) => sum + t.amount, 0);
                return spent > budgetAmount;
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
            const categoryExpense = transactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === categoryMatch)
                .reduce((sum, t) => sum + t.amount, 0);
            
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
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
            
        if (sortedCategories.length === 0) {
            return "You have no spending data to analyze.";
        }

        const response = sortedCategories.map(([cat, amount], i) => `${i + 1}. ${cat}: ${formatCurrency(amount)}`).join('\n');
        return `Your top ${sortedCategories.length} spending categories are:\n${response}`;
    }
    
    // --- Savings Query ---
    if (lowerQuery.includes('savings') || lowerQuery.includes('saved')) {
         const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
         const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
         return `You have saved ${formatCurrency(totalIncome - totalExpense)} this month.`;
    }

    // Fallback response
    return "I'm sorry, I can only answer questions about your income, spending, and budgets for the current month. Please try asking something like 'How much did I spend on food?' or 'What is my total income?'.";
}
