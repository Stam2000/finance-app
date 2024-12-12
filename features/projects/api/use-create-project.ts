import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.projects.$post>;
type RequestType = InferRequestType<typeof client.api.projects.$post>["json"];

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const personaId = localStorage.getItem("selectedPersona") || "testData";
      const response = await client.api.projects.$post(
        { json },
        {
          headers: {
            "X-Persona-ID": personaId,
          },
        },
      );
      const data = await response.json();

      return data;
    },
    onSuccess: () => {
      toast.success("Project created");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  return mutation;
};
