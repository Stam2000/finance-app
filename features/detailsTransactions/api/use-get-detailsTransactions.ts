import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { useSearchParams } from "next/navigation";
import { convertAmountFormMiliunits } from "@/lib/utils";

export const useGetDetailsTransactions = () => {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["detailsTransactions", { from, to, accountId }],
    queryFn: async () => {
      const personaId = localStorage.getItem("selectedPersona") || "testData";
      const response = await client.api.detailsTransactions.$get(
        {
          query: {
            from,
            to,
            accountId,
          },
        },
        {
          headers: {
            "X-Persona-ID": personaId,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch details");
      }

      const { data } = await response.json();
      return data.map((detailsTransaction) => ({
        ...detailsTransaction,
      }));
    },
  });

  return query;
};
