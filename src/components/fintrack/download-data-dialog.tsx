
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import {
  format,
  isWithinInterval,
  isSameMonth,
  isSameYear,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useTransactions, Transaction } from "@/contexts/transactions-context";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DownloadDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), "MMMM"),
}));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export function DownloadDataDialog({ isOpen, onClose }: DownloadDataDialogProps) {
  const { transactions } = useTransactions();
  const [activeTab, setActiveTab] = React.useState("month");
  
  // Month state
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYearForMonth, setSelectedYearForMonth] = React.useState(currentYear);
  
  // Year state
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  
  // Period state
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = React.useState<Date | undefined>(endOfMonth(new Date()));

  const generateAndDownloadCsv = (dataToExport: Transaction[], filename: string) => {
    if (dataToExport.length === 0) {
      toast({ description: "No transaction data to download for this period." });
      return;
    }

    const headers = ['date', 'type', 'amount', 'category', 'name', 'spendingType'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(t => [
        format(new Date(t.date), "dd-MM-yyyy"),
        t.type,
        t.amount,
        t.category,
        `"${t.name.replace(/"/g, '""')}"`,
        t.spendingType || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your transaction data is being downloaded."
    });
    onClose();
  };

  const handleDownload = () => {
    let dataToExport: Transaction[] = [];
    let filename = "fintrack-transactions";

    if (activeTab === "month") {
      const targetDate = new Date(selectedYearForMonth, selectedMonth);
      dataToExport = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isSameMonth(transactionDate, targetDate) && isSameYear(transactionDate, targetDate);
      });
      filename += `-${format(targetDate, "yyyy-MM")}`;
    } 
    else if (activeTab === "year") {
      dataToExport = transactions.filter(t => isSameYear(new Date(t.date), new Date(selectedYear, 0)));
      filename += `-${selectedYear}`;
    } 
    else if (activeTab === "period" && dateFrom && dateTo) {
      dataToExport = transactions.filter(t => isWithinInterval(new Date(t.date), { start: dateFrom, end: dateTo }));
      filename += `-${format(dateFrom, "yyyy-MM-dd")}_to_${format(dateTo, "yyyy-MM-dd")}`;
    }

    generateAndDownloadCsv(dataToExport, filename);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Transaction Data</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="period">Period</TabsTrigger>
          </TabsList>

          <TabsContent value="month" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedYearForMonth.toString()} onValueChange={(v) => setSelectedYearForMonth(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="year" className="space-y-4 pt-4">
             <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
          </TabsContent>

          <TabsContent value="period" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : <span>Pick a start date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus/></PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                         <Button
                            variant={"outline"}
                            className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : <span>Pick an end date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus/></PopoverContent>
                </Popover>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
