"use client";

import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, CircleX, Grip } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { useLayoutEffect } from "react";
/* import DOMPurify from "dompurify" */

import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOpenChat } from "@/features/chat/hook/use-open-AIchat";
import { useUpdateChat } from "@/features/chat/hook/use-update-message";
import { sendAiMessage } from "@/lib/utils";
import { motion } from "framer-motion";
import MessageLoading from "./message-loading";
import MarkdownTypewriter from "./markdown-typer";
import { ListRestart } from "lucide-react";
import { useGenFollowUpQ } from "@/features/chat/api/use-follow-up";
import { Description } from "@radix-ui/react-dialog";

type user = "AI" | "user";
interface Message {
  sender: user;
  content: string;
}

export const Chat = () => {
  const { chatOpen, toggleChatOpen } = useOpenChat();
  const personaId = localStorage.getItem("selectedPersona") || "testData";
  const {
    personaDes,
    setFollowQ,
    followUpQ,
    followHistory,
    threadId,
    resetMessage,
    reset,
    setThreadId,
    updateLastMessage,
    isloading,
    setIsLoading,
    messages,
    updateMessage,
    setFormData,
    formData,
    removeFile,
    personaInfo,
  } = useUpdateChat();
  const [fileNames, setFilenames] = useState<string[]>([]);
  const chat = useRef<HTMLDivElement>(null);
  const genFollowUpQ = useGenFollowUpQ();

  console.log(personaInfo)
  console.log(personaDes)

  let perInfo = JSON.parse(personaInfo);
  perInfo = { name: perInfo.name, Description: perInfo.description };
  perInfo = JSON.stringify(perInfo);

  const newChatCreate = () => {
    setFilenames([]);
    reset();
    setThreadId("");
    resetMessage();
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (chat.current) {
      chat.current.scrollTo({
        top: chat.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height - important to shrink on delete
      textareaRef.current.style.height = "50px";
      // Set height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [formData.question]);

  const handleGenFollowU = () => {
    genFollowUpQ.mutate(
      { personaDes, followHistory },
      {
        onSuccess: (data) => {
          // Handle the successful response
          setFollowQ(data);
        },
        onError: (error) => {
          // Handle any errors
          console.error("Error occurred:", error);
        },
      },
    );
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {

    if (e) e.preventDefault();
    setFilenames([]);
    sendAiMessage({
      threadId,
      setIsLoading,
      setThreadId,
      updateLastMessage,
      updateMessage,
      formData,
      setFormData,
      personaId,
      personaInfo: perInfo,
    });

  };

  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.target instanceof HTMLInputElement && e.target.files) {
      const { files: filesList } = e.target;
      const files: File[] = Array.from(filesList);
      setFormData({ Files: files });
      setFilenames((prev) => {
        const newFileNames = files.map((file) => file.name);
        return [...prev, ...newFileNames]; // Add new filenames to the list
      });
    } else {
      const { name, value }: { name: string; value: string } = e.target;
      setFormData({ question: value });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setFilenames([]);
      sendAiMessage({
        threadId,
        setIsLoading,
        setThreadId,
        updateLastMessage,
        updateMessage,
        formData,
        setFormData,
        personaId,
        personaInfo,
      });
    }

  };
  const handleSubmitButton = (message: string) => {
 
    sendAiMessage({
      threadId,
      setIsLoading,
      setThreadId,
      updateLastMessage,
      updateMessage,
      formData,
      message,
      setFormData,
      personaId,
      personaInfo,
    });

  };
 

  const handleRemoveFile = (name: string) => {
    removeFile(name);
    setFilenames((prev) => prev.filter((nm) => nm !== name));
  };

  const isSubmitDisabled =
    formData.question.trim() === "" && formData.Files.length === 0;

  return (
    <div
      className={`fixed  z-50 md:bottom-2 top-2 left-2 md:left-auto bottom-2 border-black right-0 md:top-2 overflow-hidden bg-slate-100
                        pt-14 rounded-md  border-[1px]  transition-all duration-400 ease-in-out 
                        ${chatOpen ? "translate-x-0 right-2 md:right-2" : "translate-x-full right-0  md:right-0"} border-black  md:w-2/5`}
    >
      <div className=" px-3 py-2 flex  items-start gap-2 justify-between absolute top-0 left-0 right-0 ">
        <div className="text-xl items-center justify-between text-slate-900 flex gap-2 h-full">
          <Grip className="size-4 " />
          <Bot className="text  size-8" />
          <button
            onClick={newChatCreate}
            className="flex shadow-md hover:bg-slate-900 hover:text-white border-[1px] border-slate-300 bg-slate-300 cursor-pointer items-center gap-2 text-xs text-slate-900 py-2 px-4 rounded-sm"
          >
            New Chat
          </button>
        </div>
        <CircleX
          className="text-slate-900 hover:text-slate-500 hover:cursor-pointer"
          onClick={toggleChatOpen}
        />
      </div>

      {messages.length ? (
        <div ref={chat} className=" pt-4 overflow-y-auto h-[calc(100%-130px)]">
          {messages.map((message, index) => {
            const sender = message.sender;
            return (
              <div
                key={index}
                className={`flex ${sender === "user" ? "text-left items-center" : "text-left items-start  "} mr-4 ml-1`}
              >
                {sender === "AI" && (
                  <motion.div
                    initial={{
                      x: -20,
                    }}
                    animate={{
                      x: 0,
                    }}
                  >
                    <Avatar className="bg-slate-800 shadow-md mt-1 text-white flex items-center justify-center">
                      <img className="text-white" src="/ailog.webp" />
                    </Avatar>
                  </motion.div>
                )}
                {isloading && message.content === "" ? (
                  <motion.div
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    transition={{ delay: 0.05 }}
                    className="bg-gradient-to-tl mt-1 from-white from-50% to-stone-50 shadow-md text-sm border-slate-50 rounded-xl p-2 overflow-auto ml-3 mr-3 mb-3 to-90% border-[1px]  w-fit"
                  >
                    <MessageLoading />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ x: -20, opacity: 0, scale: 0 }}
                    animate={{ x: 0, scale: 1, opacity: 1 }}
                    className={` font-oxygen  shadow-md text-sm border-slate-50 border-[1px] 
                      ${sender === "user" ? "bg-gradient-to-r from-slate-900 from-10% to-slate-700 to-90% text-white" : "bg-gradient-to-tl from-white from-50% to-stone-50 to-90% border-[1px]"} 
                      rounded-xl overflow-hidden ml-2 mr-3 mb-3 max-w-full`}
                  >
                    {/* <div dangerouslySetInnerHTML={{__html:message.content}} /> */}
                    {sender === "user" ? (
                      <div
                        className="p-4"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    ) : (
                      <div className="w-full">
                        <MarkdownTypewriter
                          className="text-sm"
                          content={message.content}
                          typeSpeed={10}
                          cursor={{
                            shape: "block",
                            color: "bg-black",
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2, // Adjust the delay as needed
              },
            },
          }}
          className="flex-col gap-2 flex h-[calc(100%-150px)]   p-4 items-center justify-center "
        >
          {followUpQ.map((q, i) => (
            <motion.button
              key={q}
              disabled={genFollowUpQ.isPending}
              className={` ${genFollowUpQ.isPending ? "bg-slate-400 border-slate-400 hover:cursor-wait" : "bg-gradient-to-r from-slate-800 from-10% to-slate-700 to-90%  border-slate-800 "} text-sm md:text-md rounded-md border-[1px] font-oxygen h-14 w-full text-white shadow-lg flex items-center  justify-center w-x-auto  p-[5px]`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                handleSubmitButton(q);
              }}
            >
              {q}
            </motion.button>
          ))}
          <button
            disabled={genFollowUpQ.isPending}
            onClick={() => {
              handleGenFollowU();
            }}
            className="rounded-full text-slate-700"
          >
            {genFollowUpQ.isPending ? <MessageLoading /> : <ListRestart />}
          </button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} action="">
        <div className="absolute mt-44  bottom-0 flex max-w-full flex-col left-0 right-0">
          <div className="flex flex-1  max-w-full items-end justify-around  ">
            <div className="flex-1 max-w-full mb-2 pr-3 pl-3 ">
              <Textarea
                id="chat-main-textarea"
                onKeyDown={handleKeyDown}
                ref={textareaRef}
                name="question"
                placeholder="Ask a follow up…"
                value={formData.question}
                onChange={handleOnchange}
                className={cn(
                  "resize-none overflow-auto w-full flex-1 mt-3 rounded-xl bg-white p-3 pb-1.5 text-sm",
                  "outline-none ring-0 shadow-md border-[1px] border-emerald-950/10 focus-visible:ring-0 focus-visible:ring-offset-0",
                  "min-h-[60px] max-h-[150px]",
                )}
                style={{
                  height: textareaRef.current
                    ? `${textareaRef.current.scrollHeight}px`
                    : "auto",
                }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-0 p-4 flex-1 gap-2">
            <Button
              type="button"
              onClick={() => document.getElementById("file-upload")?.click()}
              className=" shadow-lg text-white"
            >
              <Paperclip className="size-4" />
              <input
                id="file-upload"
                type="file"
                name="file"
                className="hidden"
                onChange={handleOnchange}
                multiple
              />
            </Button>

            <div className="absolute left-20 lg:left-32 bg-white px-3 rounded-md max-h-[70px] overflow-y-auto">
              {fileNames.map((name, index) => {
                return (
                  <div
                    className="text-black flex items-center gap-1 justify-between"
                    key={index}
                  >
                    {name}
                    <CircleX
                      onClick={() => handleRemoveFile(name)}
                      className="size-4 text-amber-700 hover:cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
            <button
              type="submit"
              className={`flex shadow-lg items-center gap-2 ${
                isSubmitDisabled || isloading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "hover:bg-black/50% bg-black cursor-pointer"
              } text-white py-2 px-4 rounded-sm`}
              disabled={isSubmitDisabled || isloading}
            >
              Send <Send className="size-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Chat;
