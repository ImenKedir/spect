import { ArrowTopRightIcon } from "@radix-ui/react-icons";

const Recomendations: React.FC<{ onClick: (userMessage: string) => void }> = ({
  onClick,
}) => {
  const questions = [
    "What is a GMP Contract?",
    "What manufacturer is providing my Corridor Lockers?",
    "Covid has just delayed the Phoenix project by a month. Will I the contractor be responsible for this delay?",
    "Who is responsible for site inspections?",
  ];

  return (
    <div className="min-h-[100vh]">
      <div className="grid grid-cols-1 p-2 font-thin md:grid-cols-2">
        {/*
            Grid of recommended questions
         */}
        {questions.map((question, index) => (
          <button
            key={index}
            className="m-2 rounded-lg bg-white from-slate-600 to-gray-500 p-[2px] text-left shadow-xl dark:bg-bullet dark:bg-gradient-to-r"
            onClick={() => onClick(question)}
          >
            <div className="flex h-full justify-between rounded-lg bg-white px-4 py-2 dark:bg-bullet">
              <div>{question}</div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg p-2 hover:shadow-none">
                <ArrowTopRightIcon />
              </div>
            </div>
          </button>
        ))}
        {/*
            Grid of recommended questions
        */}
      </div>
    </div>
  );
};

export default Recomendations;
