import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function BudgetCard() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-4">
        <CardTitle>Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Progress value={45} className="h-2 bg-primary/20" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>Utilized: $900</span>
          <span>Total: $2,000</span>
        </div>
      </CardContent>
    </Card>
  );
}
