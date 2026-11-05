"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import type { Category, Transaction, TransactionType } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { todayDateOnly } from "@/lib/date-only";
import { useDataRefresh } from "@/store/data-refresh";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Choose a category"),
  amount: z.number().positive("Amount must be greater than 0").max(100000000, "Amount is too large").refine(
    (amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001,
    "Use no more than 2 decimal places",
  ),
  note: z.string().trim().max(200, "Maximum 200 characters").optional(),
  date: z.string().min(1, "Choose a date").refine((value) => value <= todayDateOnly(), "Date cannot be in the future"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionFormDialog({ open, onOpenChange, transaction, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState(transaction?.category.id ?? "");
  const invalidate = useDataRefresh((state) => state.invalidate);
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type ?? "EXPENSE",
      categoryId: transaction?.category.id ?? "",
      amount: transaction?.amount ?? 0,
      note: transaction?.note ?? "",
      date: transaction ? transaction.date.slice(0, 10) : todayDateOnly(),
    },
  });

  useEffect(() => {
    if (!open) return;
    api.get<{ data: { categories: Category[] } }>(`/categories?type=${type}`)
      .then((response) => setCategories(response.data.data.categories))
      .catch(() => toast.error("Unable to load categories"));
  }, [open, type]);

  const submit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        type: values.type,
        categoryId: values.categoryId,
        amount: values.amount,
        note: values.note || undefined,
        date: values.date,
      };
      if (transaction) {
        await api.patch(`/transactions/${transaction.id}`, payload);
        toast.success("Transaction updated");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transaction added");
      }
      onOpenChange(false);
      invalidate();
      onSaved();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to save transaction";
      toast.error(message);
    }
  });

  const changeType = (next: TransactionType) => {
    setType(next);
    setCategoryId("");
    form.setValue("type", next);
    form.setValue("categoryId", "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>Record an income or expense for your account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Tabs value={type} onValueChange={(value) => changeType(value as TransactionType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="INCOME">Income</TabsTrigger>
              <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" min="0.01" inputMode="decimal" {...form.register("amount", { valueAsNumber: true })} />
              {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="date" type="date" max={todayDateOnly()} className="pl-9" {...form.register("date")} />
              </div>
              {form.formState.errors.date && <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(nextCategoryId) => {
              setCategoryId(nextCategoryId);
              form.setValue("categoryId", nextCategoryId, { shouldValidate: true });
            }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" maxLength={200} placeholder="Optional description" {...form.register("note")} />
            {form.formState.errors.note && <p className="text-xs text-destructive">{form.formState.errors.note.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <LoaderCircle className="animate-spin" />}
              {transaction ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
