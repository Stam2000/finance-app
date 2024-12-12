import { Input } from "./ui/input";
import { sendAiMessage } from "@/lib/utils";
import { useUpdateChat } from "@/features/chat/hook/use-update-message";
import { useOpenChat } from "@/features/chat/hook/use-open-AIchat";
import { useState } from "react";

const GoalBoard = () => {
  const {
    threadId,
    setThreadId,
    messages,
    updateMessage,
    setFormData,
    formData,
    removeFile,
  } = useUpdateChat();
  const { toggleChatOpen } = useOpenChat();
  const [value, setInputValue] = useState("");

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    setFormData({ question: e.target.value });
  };

  return (
    <div className=" flex w- flex-grow flex-col items-center justify-center rounded-2xl gap-4">
      #
    </div>
  );
};
export default GoalBoard;
