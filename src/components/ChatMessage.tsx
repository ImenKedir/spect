import { useState } from "react";

import { PersonIcon, Component1Icon } from "@radix-ui/react-icons";
import type { Message } from "~/types/chat/message";

import LoadingSpinner from "~/components/LoadingSpinner";
import DisplaySourcePDF from "./DisplaySourcePDF";

interface AIMessageProps {
  content: string | undefined;
  docs: Doc[] | undefined;
  showSources: boolean | undefined;
}

type Doc = {
  metadata: {
    page_number: number;
    source: string;
  };
  pageContent: string;
};

export const AIMessage: React.FC<AIMessageProps> = ({
  content,
  docs,
  showSources,
}) => {
  const [show, setShow] = useState<boolean>(showSources || false);
  if (!content || !docs) {
    {
      /* Loading state */
    }
    return (
      <div className="flex flex-row">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg p-2">
          <Component1Icon />
        </div>
        <div className="my-4 ml-4 mr-12 rounded-lg bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 p-[2px] shadow-xl dark:bg-bullet">
          <div className="h-full w-full rounded-lg bg-white px-4 py-2 dark:bg-bullet">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg p-2">
        <Component1Icon />
      </div>
      <div className="my-4 ml-4 mr-12 rounded-lg bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 p-[2px] shadow dark:bg-bullet">
        <div className="h-full w-full rounded-lg bg-white px-4 py-2 dark:bg-bullet">
          <div>{content}</div>
          <div className="p-2" />
          <button
            className="sel text-blue-300 underline"
            onClick={() => setShow(!show)}
          >
            {show ? "Hide Sources" : "Show Sources"}
          </button>
          {show && (
            <>
              <DisplaySourcePDF docs={docs} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const UserMessage: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="flex flex-row-reverse">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg p-2">
        <PersonIcon />
      </div>
      <div className="my-4 ml-12 mr-4 rounded-lg from-slate-600 to-gray-500 p-[2px] shadow dark:bg-bullet dark:bg-gradient-to-r">
        <div className="h-full w-full rounded-lg bg-white px-4 py-2 dark:bg-bullet">
          <div>{content}</div>
        </div>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className="flex w-full flex-col font-light md:text-lg lg:px-4">
      <UserMessage content={message.userMessage} />
      <AIMessage
        content={message.spectMessage}
        docs={message.spectSources}
        showSources={message.showSources}
      />
    </div>
  );
};

export default ChatMessage;
