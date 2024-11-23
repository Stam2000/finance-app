import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGenPersona = () => {
  return useMutation({
    mutationFn: async () => {
 

      // Make the API call
      const response = await client.api.conversation["sampleDataChat"].$get();

      const {data} =await response.json()
      // Log the received data


      // Return the data
      return data;
    },
    onSuccess: (data) => {
      // Handle success if needed

    },
    onError: (error) => {
      // Handle the error
      console.error('Error fetching data:', error);
    },
  });
};
 