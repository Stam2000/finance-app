import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.accounts)[":id"]["$patch"]
>["json"];

export const useEditAccount = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const personaId = localStorage.getItem("selectedPersona") || "testData";
      const response = await client.api.accounts[":id"]["$patch"](
        { param: { id }, json },
        {
          headers: {
            "X-Persona-ID": personaId,
          },
        },
      );
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account updated");
      queryClient.invalidateQueries({ queryKey: ["accounts", { id }] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: () => {
      toast.error("Failed to create account");
    },
  });

  return mutation;
};
