"use client";

import { useState } from "react";
import { format, parse } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportTable } from "./import-table";
import { useCreateCategory } from "@/features/categories/api/use-create-categories";
import { convertAmountToMiliunits } from "@/lib/utils";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

type Props = {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  data: string[][];
};
interface SelectedColumnState {
  [key: string]: string | null;
}

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyy-MM-dd";

const requiredOptions = ["amount", "date", "payee"];

export const ImportCard = ({ data, onSubmit, onCancel }: Props) => {
  const categoriesQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const categories = categoriesQuery.data;

  const [selectedColums, setSelectedColumns] = useState<SelectedColumnState>(
    {},
  );
  const [categoryCache, setCategoryCache] = useState<Record<string, string>>(
    {},
  );
  const header = data[0];
  const body = data.slice(1);

  const onTableHeadchange = (columnIndex: number, value: string | null) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };

      for (const index in newSelectedColumns) {
        if (newSelectedColumns[index] === value) {
          newSelectedColumns[index] = null;
        }
      }

      if (value === "skip") {
        value = null;
      }

      newSelectedColumns[`column_${columnIndex}`] = value;

      return newSelectedColumns;
    });
  };

  const progress = Object.values(selectedColums).filter(Boolean).length;
  const handleContinue = async () => {
    const localCache = { ...categoryCache };

    const getIndexColumn = (column: string) => {
      return column.split("_")[1];
    };

    const mappedData = {
      headers: header.map((_header, index) => {
        /* const columnIndex=getIndexColumn(`column_${index}`) */
        return selectedColums[`column_${index}`];
      }),
      body: body
        .map((row) => {
          const transFormedRow = row.map((cell, index) => {
            /* const columnIndex = getIndexColumn(`column_${index}`) */
            return selectedColums[`column_${index}`] ? cell : null;
          });

          return transFormedRow.every((item) => item === null)
            ? []
            : transFormedRow;
        })
        .filter((row) => row.length > 0),
    };

    const arrayOfData = mappedData.body.map((row) => {
      return row.reduce((acc: any, cell, index) => {
        const header = mappedData.headers[index];
        if (header != null) {
          acc[header] = cell;
        }

        return acc;
      }, {});
    });

    const findCategoryId = [];

    for (const item of arrayOfData) {
      const CategoryName = item.category;
      let category: any = categories?.find(
        (category) => category.name === CategoryName,
      );

      if (!category) {
        if (!localCache[CategoryName]) {
          const result = await categoryMutation.mutateAsync({
            name: CategoryName,
          });
          if ("data" in result) {
            category = result.data;
            localCache[CategoryName] = category.id;
            setCategoryCache((prevCache) => ({
              ...prevCache,
              [CategoryName]: category!.id,
            }));
            item.categoryId = category.id;
            delete item["category"];
            findCategoryId.push(item);
            continue;
          }
        } else {
          item.categoryId = localCache[CategoryName];
          delete item["category"];
          findCategoryId.push(item);
          continue;
        }
      }

      item.categoryId = category!.id;
      delete item["category"];
      findCategoryId.push(item);
    }

    const formatedData = findCategoryId.map((item) => ({
      ...item,
      amount: convertAmountToMiliunits(parseFloat(item.amount)),
      date: format(parse(item.date, dateFormat, new Date()), outputFormat),
    }));

    onSubmit(formatedData);
  };
  return (
    <div className="w-full max-w-screen-2xl mx-auto pb-10 -mt-24">
      <Card className="border-none drop-shadow-none">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Import Transactions
          </CardTitle>
          <div className="flex flex-col gap-y-2 itens-center gap-x-2 lg:flex-row">
            <Button onClick={onCancel} size="sm" className="w-full lg:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              size="sm"
              className="w-full lg:w-auto"
              disabled={progress < requiredOptions.length}
            >
              Continue ({progress} / {requiredOptions.length}){" "}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            headers={header}
            body={body}
            selectedColumns={selectedColums}
            onTableHeadSelectChange={onTableHeadchange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
