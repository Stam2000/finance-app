import { toast } from "sonner";
import { z } from "zod";
import { client } from "@/lib/hono";
import axios from "axios";
import { InferResponseType, InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsType, DetailsTransactionsType } from "@/db/schema";

type ResponseType = (TransactionsType & {
  detailsTransactions: DetailsTransactionsType[];
})[];
type RequestType = InferRequestType<
  (typeof client.api.conversation)["createProfil"]["$post"]
>["json"];

type ProgressData = {
  step: string;
  message: string;
  status: string;
  progress?: number;
  data?: any;
  transaction?: any;
  processedTransactions?: any[];
  error?: any;
};

export const useGenerateData = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    void, // Adjust the types as needed
    Error,
    RequestType & {
      onProgress?: (status: ProgressData) => void;
      onGeneratedData?: (data: any) => void;
      onEntitiesUploaded?: (data: any) => void;
      onGeneratedPersonaId?: (personaId: string) => void;
      onExecution?: () => void;
      onStarted?: () => void;
    }
  >({
    mutationFn: async ({
      onProgress,
      onGeneratedData,
      onEntitiesUploaded,
      onGeneratedPersonaId,
      onExecution,
      onStarted,
      ...json
    }) => {
      const abortController = new AbortController();
      const baseURL = process.env.NEXT_PUBLIC_APP_URL;
      onStarted?.();
      onExecution?.();

      onProgress?.({
        step: "extendPersona",
        status: "running",
        message: "Extending persona...",
      });
      toast.info("Extending persona...");

      const response = await fetch(`${baseURL}/api/conversation/createProfil`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(json),
        signal: abortController.signal,
      });
      
      

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");

          // Parse SSE message
          const lines = chunk.split("\n");
          let eventType = "message";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              data += line.slice(5).trim();
            }
          }

          if (data) {
            const eventData = JSON.parse(data);

            // Handle different event types
            switch (eventType) {
              case "extendPersona":
                toast.info(eventData.message);
                onProgress?.(eventData);
                break;

              case "extendedPersona":
                toast.info(eventData.message);

                onGeneratedData?.(eventData.data);
                onProgress?.(eventData);
                break;

              case "fiDataGenerationStart":
                onEntitiesUploaded?.(eventData.data);
                onProgress?.(eventData);
                break;

              case "weekGen":
                toast.info(eventData.message);
                onEntitiesUploaded?.(eventData.data);
                console.log(eventData);
                onProgress?.(eventData);
                break;

              case "fiDataGenerationEnd":
                toast.info(eventData.message);
                onProgress?.(eventData);
                break;

              case "updatingFiDataStart":
                toast.info(eventData.message);
                onProgress?.(eventData);
                break;

              case "updatingFiDataEnd":
                toast.info(eventData.message);
                onProgress?.(eventData);
                break;

              case "complete":
                toast.success("Transactions created");
                onGeneratedPersonaId?.(eventData.data);
                onProgress?.(eventData);
                console.log(eventData);
                queryClient.invalidateQueries({ queryKey: ["transactions"] });
                break;

              case "error":
                throw new Error(eventData.message);

              default:
                console.warn(`Unknown event: ${eventType}`);
            }
          }
        }
      }

      return;
    },
    onError: (error) => {
      toast.error(`Failed to update transactions: ${error.message}`);
    },
  });

  return mutation;
};
