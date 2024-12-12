import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";

// Define TypeScript interfaces for better type safety
interface WeeklyAnalyseInput {
  personaDes: string;
}

interface WeeklyAnalyseResponse {
  res: any; // Replace 'any' with the actual type returned by your API
  reducedText: string;
}

export const useGetWeeklyAnalyse = () => {
  // Initialize the mutation
  const mutation = useMutation<
    WeeklyAnalyseResponse,
    Error,
    WeeklyAnalyseInput
  >({
    mutationFn: async (input) => {
      // Ensure this code runs only on the client side
      if (typeof window === "undefined") {
        throw new Error("Cannot access localStorage on the server.");
      }

      // Retrieve personaId from localStorage
      const personaId = localStorage.getItem("selectedPersona") || "testData";

      try {
        // Make the API call
        const response: any = await client.api.conversation[
          "weeklyResume"
        ].$post(
          { json: input.personaDes },
          {
            headers: {
              "X-Persona-ID": personaId,
              // Add other persona-related headers if needed
            },
          },
        );

        // Check if the response is okay
        if (!response.ok) {
          throw new Error("Failed to fetch weekly analysis.");
        }

        // Parse the JSON response
        const { res, reducedText }: WeeklyAnalyseResponse =
          await response.json();

        // Return the parsed data
        return { res, reducedText };
      } catch (error: any) {
        // Optionally, enhance error logging here

        throw error;
      }
    },
    onSuccess: (data) => {
      // Handle success if needed
      // You can perform additional side effects here, such as updating context or triggering other actions
    },
    onError: (error) => {
      // Handle the error
      // Optionally, integrate with your UI to display error messages to the user
    },
    // Optional: You can add additional options like `onSettled`, `retry`, etc.
  });

  return mutation;
};
