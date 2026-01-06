
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TransactionSchema = z.object({
    id: z.string(),
    type: z.enum(['income', 'expense']),
    name: z.string(),
    amount: z.number(),
    date: z.string(),
    category: z.string(),
    account: z.string(),
    spendingType: z.enum(['need', 'want']).optional(),
});

const FinancialSummaryInputSchema = z.array(TransactionSchema);

const FinancialSummaryOutputSchema = z.object({
  summary: z.string().describe("A brief, one-sentence overview of the user's spending for the period."),
  positiveObservation: z.string().describe("A specific, positive spending habit observed from the data. Be encouraging."),
  areaForImprovement: z.string().describe("A specific category or habit where the user could improve their spending."),
  suggestion: z.string().describe("A single, actionable tip to help the user save money or improve their finances based on the data."),
  monthlyAnalysis: z.string().describe("A look at spending patterns within the current month."),
  yearlyAnalysis: z.string().describe("A high-level summary of spending throughout the year."),
  futurePrediction: z.string().describe("A forecast of where your finances might be heading based on current trends."),
});

export async function getFinancialSummary(transactions: z.infer<typeof FinancialSummaryInputSchema>) {
    const summary = await financialSummaryFlow(transactions);
    return summary;
}

const prompt = ai.definePrompt({
    name: 'financialSummaryPrompt',
    input: { schema: FinancialSummaryInputSchema },
    output: { schema: FinancialSummaryOutputSchema },
    prompt: `You are a friendly and encouraging financial assistant. Analyze the following list of transactions and provide a concise, insightful summary.

    Based on these transactions:
    {{{json input}}}
    
    Generate a summary of the user's financial activity. Identify one positive trend and one area for potential improvement. Provide one actionable suggestion.
    Also provide a monthly analysis, a yearly analysis, and a future prediction based on the data. Be brief and use a positive and helpful tone.`,
});

const financialSummaryFlow = ai.defineFlow(
  {
    name: 'financialSummaryFlow',
    inputSchema: FinancialSummaryInputSchema,
    outputSchema: FinancialSummaryOutputSchema,
  },
  async (transactions) => {
    const { output } = await prompt(transactions);
    return output!;
  }
);
