import Link from "next/link";
import { ExitIcon } from "@radix-ui/react-icons";

const LogOut: React.FC = () => {
  return (
    <Link href="/">
      <button className="flex w-full items-center p-4">
        <ExitIcon className="w-5 h-5" />
        <div className="w-2"/>
        <div>Log out</div>
      </button>
    </Link>
  );
};

export default LogOut;
