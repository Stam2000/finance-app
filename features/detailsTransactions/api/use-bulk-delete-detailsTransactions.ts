import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.detailsTransactions)["bulk-delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.detailsTransactions)["bulk-delete"]["$post"]
>["json"];

export const useBulkDeleteDetailsTransactions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const personaId = localStorage.getItem("selectedPersona") || "testData";
      const response = await client.api.detailsTransactions["bulk-delete"][
        "$post"
      ](
        { json },
        {
          headers: {
            "X-Persona-ID": personaId,
          },
        },
      );
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Succesful Deleted");
      queryClient.invalidateQueries({ queryKey: ["detailsTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to delete details");
    },
  });

  return mutation;
};
