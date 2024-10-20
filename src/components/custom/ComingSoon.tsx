import { FC } from "react";

import { Separator } from "../ui/separator";

interface ComingSoonProps {
  label?: string;
}

const ComingSoon: FC<ComingSoonProps> = ({ label }) => {
  return (
    <main className="mt-[10%] flex h-full flex-col items-center p-4 pt-2">
      {/* <Image
        src="/assets/placeholder-5.svg"
        alt="Placeholder"
        width={300}
        height={300}
      /> */}
      <h2 className="mt-6 text-md font-bold text-slate-500">
        <span className="border-b-2 border-[#A1926F] text-[#A1926F]">
          {label}
        </span>{" "}
        <Separator />
        <span>{"Coming soon"}</span>
      </h2>
    </main>
  );
};
export default ComingSoon;
