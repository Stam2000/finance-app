import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetip = () => {
  const query = useQuery({
    queryKey: ["ip"],
    queryFn: async () => {
      const response = await client.api.getip.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
