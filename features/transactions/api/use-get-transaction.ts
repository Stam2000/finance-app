import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import {
  convertAmountFormMiliunits,
  convertAmountFromMiliunits,
} from "@/lib/utils";

export const useGetTransaction = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["transaction", { id }],
    queryFn: async () => {
      const personaId = localStorage.getItem("selectedPersona") || "testData";
      const response = await client.api.transactions[":id"]["$get"](
        {
          param: { id },
        },
        {
          headers: {
            "X-Persona-ID": personaId,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();
      return {
        ...data,
      };
    },
  });

  return query;
};
