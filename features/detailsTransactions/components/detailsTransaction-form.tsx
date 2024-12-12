import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Select } from "@/components/select";
import { AmountInput } from "@/components/account-input";
import { useOverviewNewDetails } from "../hooks/use-overview-newdetails";
import { useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertdetailsTransactionsSchema } from "@/db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { convertAmountToMiliunits } from "@/lib/utils";

const formSchema = z.object({
  categoryId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  unitPrice: z.string(),
  amount: z.string(),
  quantity: z.string(),
  name: z.string().optional(),
});
const apiSchema = insertdetailsTransactionsSchema.omit({});

type FormValues = z.input<typeof formSchema>;
type ApiValues = z.input<typeof apiSchema>;

type Props = {
  id?: string;
  transactionId?: string;
  defaultValues?: FormValues;
  //TODO modify Submit : doit plutot update le react Zustand avec les valeurs
  onSubmit: (values: ApiValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  categoryOptions: { label: string; value: string }[];
  projectOptions: { label: string; value: string }[];
  onCreateCategory?: (name: string) => void;
};

export const TransactionForm = ({
  id,
  transactionId,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  projectOptions,
  categoryOptions,
  onCreateCategory,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const { temporalId, updateId } = useOverviewNewDetails();
  const handleSubmit = (values: any) => {
    updateId();
    const quantity = values.quantity;
    const unitPrice = parseFloat(values.unitPrice);
    const amount = parseFloat(values.amount);
    onSubmit(
      id
        ? {
            ...values,
            amount,
            unitPrice,
            transactionId,
            quantity: +quantity,
          }
        : {
            ...values,
            id: `${temporalId}`,
            amount,
            unitPrice,
            transactionId,
            quantity: +quantity,
          },
    );
    form.reset({
      name: "",
      quantity: "",
      categoryId: undefined, // Assuming it's nullable
      unitPrice: undefined,
      amount: undefined,
      projectId: undefined,
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const quantity = parseFloat(form.watch("quantity")?.replace(",", "."));
  const unitPrice = parseFloat(form.watch("unitPrice")?.replace(",", "."));

  const amount = (quantity || 0) * (unitPrice || 0);

  useEffect(() => {
    form.setValue("amount", amount.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [amount, form]);
  return (
    <div className="flex-1">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-4"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={disabled}
                    placeholder="Add a Name"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="quantity"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    disabled={disabled}
                    placeholder="Quantity"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="categoryId"
            control={form.control}
            render={({ field }) => {
              field.value;
              return (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      placeholder="Select a category"
                      options={categoryOptions}
                      onCreate={onCreateCategory}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            name="projectId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <FormControl>
                  <Select
                    placeholder="Select a project"
                    options={projectOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="unitPrice"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <AmountInput
                    {...field}
                    disabled={disabled}
                    placeholder="0.00"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="amount"
            control={form.control}
            render={({ field }) => {
              field.value = amount.toString();
              return (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <AmountInput
                      value={field.value || amount.toString()}
                      onChange={field.onChange}
                      disabled={disabled}
                      placeholder="0.00"
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <Button className="w-full" disabled={disabled}>
            {id ? "Save changes" : "Add"}
          </Button>
          {!!id && (
            <Button
              type="button"
              disabled={disabled}
              onClick={handleDelete}
              className="w-full"
              variant="outline"
            >
              <Trash className="size-4 mr-2" />
              Delete
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};
