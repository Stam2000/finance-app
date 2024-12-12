import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { BaseMessage } from "@langchain/core/messages";

export const useGenFollowUpQ = () => {
  return useMutation({
    mutationFn: async (json: {
      personaDes: string;
      followHistory: BaseMessage[];
    }) => {
      const personaId = localStorage.getItem("selectedPersona") || "testData";

      // Make the API call
      const response = await client.api.conversation["followUpGestions"].$post(
        { json },
        {
          headers: {
            "X-Persona-ID": personaId,
          },
        },
      );

      const { data } = await response.json();
      // Log the received data

      // Return the data
      return data;
    },
    onSuccess: (data) => {
      // Handle success if needed
    },
    onError: (error) => {
      // Handle the error
      console.error("Error fetching data:", error);
    },
  });
};
