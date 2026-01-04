import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function InvestmentCard() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-2 pb-0">
        <CardTitle className="text-base font-medium">Investments</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <p className="text-xl font-bold">$1,200</p>
        <p className="text-xs text-muted-foreground">3 active</p>
        <Progress value={65} className="mt-1 h-2 bg-primary/20" />
      </CardContent>
    </Card>
  );
}
