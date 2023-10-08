import { type NextPage } from "next";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { v4 as uuidv4 } from "uuid";

import type { Message } from "~/types/chat/message";

import ChatInput from "~/components/ChatInput";
import ChatMessage from "~/components/ChatMessage";
import ThemeToggle from "~/components/ThemeToggle";
import Recomendations from "~/components/Recommendations";
import LogOut from "~/components/LogOut";
import UploadDocuments from "~/components/UploadDocuments";

const MAX_MEMORY_SIZE = 10;

const Chat: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [spectMemory, setSpectMemory] = useState<string[]>([]);

  const askQuestion = api.chat.askQuestion.useMutation({
    onSuccess: (data) => {
      console.log(data);
      const newMessage: Message = {
        id: data.messageId,
        userMessage: data.userMessage,
        spectMessage: data.spectMessage,
        spectSources: data.spectSources,
        showSources: data.showSources,
      };

      // update conversation history
      setConversationHistory((history) => [
        ...history.filter((message) => message.id !== data.messageId),
        newMessage,
      ]);

      // update spect's memory
      if (spectMemory.length >= MAX_MEMORY_SIZE) {
        setSpectMemory((memory) => [...memory.slice(memory.length / 2)]);
      }
      setSpectMemory((memory) => [...memory, data.newMemory]);
    },
  });

  const handleMessageSend = (userMessage: string) => {
    const messageId = uuidv4();
    const newMessage: Message = {
      id: messageId,
      userMessage: userMessage,
      spectMessage: undefined,
      spectSources: undefined,
      showSources: undefined,
    };
    setConversationHistory([...conversationHistory, newMessage]);
    askQuestion.mutate({
      messageId: messageId,
      userMessage: userMessage,
      memory: spectMemory,
    });
  };

  {
    /* This is to make sure ssr does not break our theme */
  }
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  {
    /* Without this the server might render the wrong theme */
    /* There is no way to know the client theme from the server */
  }

  return (
    <div className="flex min-h-[100vh]">
      {/* left side pannel */}
      <div className="hidden w-[250px] flex-none shadow-xl dark:shadow-none md:block">
        <div className="fixed z-20 h-full w-[250px] bg-white dark:bg-bullet ">
          <div className="pt-lg pb-sm sticky top-0 flex h-full flex-col justify-between divide-y">
            {/* This div is for the header of the Spect AI plus Theme Toggle  */}
            <div>
              <div className="flex items-center justify-between p-4 text-4xl font-bold">
                <h1 className="text-black dark:text-white">Spect AI</h1>
                <ThemeToggle />
              </div>
            </div>
            {/* This div is for the body for the upload and display documents buttons */}
            <div className="h-full">
              <UploadDocuments />
            </div>
            {/* This div is for the footer for the logout, get help, give feedback buttons */}
            <div>
              <LogOut />
            </div>
          </div>
        </div>
      </div>
      {/* left side pannel */}
      {/* chat */}
      <div className="grow">
        <div className="h-full justify-center px-4 md:flex">
          <div className="mx-auto w-full max-w-screen-md">
            <div className="flex min-h-[100vh] flex-col bg-office dark:bg-muddy">
              <div>
                <div className="min-h-screen w-full max-w-screen-md grow items-center md:mx-auto">
                  {!conversationHistory.length && (
                    <Recomendations onClick={handleMessageSend} />
                  )}
                  {conversationHistory.map((message, index) => {
                    return <ChatMessage key={index} message={message} />;
                  })}
                </div>
                <div className="fixed bottom-0 left-0 right-0 justify-center bg-gradient-to-t from-office from-30% to-transparent pb-4 dark:bg-gradient-to-t dark:from-muddy dark:from-30% dark:to-transparent md:sticky ">
                  <ChatInput onSend={(message) => handleMessageSend(message)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* chat */}
    </div>
  );
};

export default Chat;
