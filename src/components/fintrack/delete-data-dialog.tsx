
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useTransactions } from "@/contexts/transactions-context";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DeleteDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeletionFilterState = 
    | { type: 'month', year: number, month: number }
    | { type: 'year', year: number }
    | { type: 'period', from: Date, to: Date }
    | { type: 'all' };

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), "MMMM"),
}));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export function DeleteDataDialog({ isOpen, onClose }: DeleteDataDialogProps) {
  const { deleteTransactionsByFilter } = useTransactions();
  const [activeTab, setActiveTab] = React.useState("month");
  
  // Month state
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYearForMonth, setSelectedYearForMonth] = React.useState(currentYear);
  
  // Year state
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  
  // Period state
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = React.useState<Date | undefined>(endOfMonth(new Date()));

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [filterToDelete, setFilterToDelete] = React.useState<DeletionFilterState | null>(null);
  
  const getFilterDescription = (filter: DeletionFilterState | null): string => {
    if (!filter) return "";
    switch(filter.type) {
        case "month": return `all transactions for ${months[filter.month].label} ${filter.year}`;
        case "year": return `all transactions for the year ${filter.year}`;
        case "period": return `all transactions from ${format(filter.from, "PPP")} to ${format(filter.to, "PPP")}`;
        case "all": return "ALL of your transaction data";
    }
  }

  const prepareForDelete = () => {
    let filter: DeletionFilterState | null = null;
    if (activeTab === "month") {
      filter = { type: 'month', month: selectedMonth, year: selectedYearForMonth };
    } else if (activeTab === "year") {
      filter = { type: 'year', year: selectedYear };
    } else if (activeTab === "period" && dateFrom && dateTo) {
      filter = { type: 'period', from: dateFrom, to: dateTo };
    } else if (activeTab === "all") {
      filter = { type: 'all' };
    }

    if (filter) {
        setFilterToDelete(filter);
        setIsConfirmOpen(true);
    }
  };

  const handleDelete = () => {
    if (!filterToDelete) return;

    const deletedCount = deleteTransactionsByFilter(filterToDelete);
    
    toast({
      title: "Data Deleted",
      description: `Successfully deleted ${deletedCount} transaction(s).`,
    });
    
    setIsConfirmOpen(false);
    setFilterToDelete(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction Data</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="period">Period</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
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
            
            <TabsContent value="all" className="space-y-4 pt-4 text-center text-sm text-muted-foreground">
                This will delete all transaction data permanently.
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={prepareForDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {getFilterDescription(filterToDelete)}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setFilterToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
