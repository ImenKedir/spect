import { useState } from "react";
import { useTheme } from "next-themes";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

const ChatInput: React.FC<{ onSend: (userMessage: string) => void }> = ({
  onSend,
}) => {
  const { theme } = useTheme();
  const [userMessage, setUserMessage] = useState<string>("");

  return (
    <div className="mx-auto max-w-4xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend(userMessage);
          setUserMessage("");
        }}
        className="mx-4 mb-2 flex rounded-xl text-black"
      >
        <div className="mr-4 w-full rounded-xl from-slate-600 to-gray-500 p-[2px] shadow-xl dark:bg-gradient-to-r">
          <input
            className="flex w-full rounded-xl bg-white p-4 text-sm font-thin dark:bg-bullet dark:text-white dark:placeholder-white md:text-lg"
            placeholder="Ask a question..."
            value={userMessage}
            onChange={(event) => setUserMessage(event.target.value)}
          ></input>
        </div>
        <div className="rounded-xl from-slate-600 to-gray-500 p-[2px] shadow-xl hover:shadow-none dark:bg-gradient-to-r">
          <button
            type="submit"
            className="flex h-full w-full items-center justify-center rounded-xl bg-white p-4 shadow hover:shadow-none dark:bg-bullet dark:hover:bg-muddy  "
          >
            <PaperPlaneIcon color={theme == "dark" ? "white" : "black"} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
