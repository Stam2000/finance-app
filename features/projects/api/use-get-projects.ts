import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { useSearchParams } from "next/navigation";

export const useGetProjects = () => {
  const params = useSearchParams();
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const personaId = localStorage.getItem("selectedPersona") || "testData";
      const response = await client.api.projects.$get(
        {
          query: {
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
        throw new Error("Failed to fetch projects");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
