
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot, Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTransactions } from "@/contexts/transactions-context";
import { useBudget } from "@/contexts/budget-context";
import { getBotResponse } from "@/lib/bot-logic";
import { subMonths, isSameMonth, isSameYear } from "date-fns";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const suggestedQuestions = [
    "How much have I spent this month?",
    "What are my top spending categories?",
    "Am I over budget on anything?",
]

export function AiChatSheet() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Bring in financial data
  const { transactions, currentMonthTransactions } = useTransactions();
  const { expenseBudgets } = useBudget();

  const previousMonthTransactions = React.useMemo(() => {
    const prevMonthDate = subMonths(new Date(), 1);
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isSameMonth(transactionDate, prevMonthDate) && isSameYear(transactionDate, prevMonthDate);
    });
  }, [transactions]);


  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 1, text: "Hi there! I'm your financial assistant. How can I help you today?", sender: "bot" }
      ]);
    }
  }, [isOpen, messages.length]);

  React.useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (text.trim() === "") return;

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: "user",
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Get bot response
    const botResponseText = getBotResponse(text, currentMonthTransactions, previousMonthTransactions, expenseBudgets);
    const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot'
    };

    // Simulate thinking
    setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
    }, 500);

    setInput("");
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 active:scale-95 transition-transform z-40"
          >
            <Bot className="h-7 w-7" />
            <span className="sr-only">Open AI Chat</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-0 pb-0 max-h-[85vh] flex flex-col"
        >
          <SheetHeader className="px-4 text-left">
            <SheetTitle>Financial Assistant</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.sender === "bot" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-xs rounded-lg p-3 text-sm ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.sender === "user" && (
                     <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User size={20}/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
                {messages.length === 1 && (
                    <div className="flex flex-col items-start gap-2 pt-4">
                        {suggestedQuestions.map((q) => (
                            <Button 
                                key={q}
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSend(q)}
                                className="bg-background"
                            >
                                {q}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
          </ScrollArea>
          
          <div className="flex items-center gap-2 border-t p-4 bg-background">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask about your finances..."
              className="h-11"
            />
            <Button size="icon" onClick={() => handleSend(input)} className="h-11 w-11">
              <Send size={20} />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
