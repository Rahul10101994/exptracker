import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SavingRateCard() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
        <CardTitle className="text-base font-medium">My Saving</CardTitle>
        <PieChart className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <p className="text-xl font-bold">48%</p>
        <p className="text-xs text-muted-foreground">Savings rate</p>
      </CardContent>
    </Card>
  );
}
