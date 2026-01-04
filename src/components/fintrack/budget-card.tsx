import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function BudgetCard() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={45} className="h-2 bg-primary/20" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>Utilized: $900</span>
          <span>Total: $2,000</span>
        </div>
      </CardContent>
    </Card>
  );
}
