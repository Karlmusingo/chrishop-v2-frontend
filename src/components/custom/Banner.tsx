import { FC } from "react";
import Button from "./Button";
import { cn } from "@/lib/utils";

interface BannerProps {
  message: string;
  visible: boolean;
  onClose?: (state: boolean) => void;
}

const Banner: FC<BannerProps> = ({ message, visible, onClose }) => {
  return (
    <div
      className={cn(
        "fixed left-[calc(var(--sidebar-width)-1rem)] right-0 top-0 z-30 mb-4 flex items-center justify-center bg-yellow-500 px-4 text-center font-semibold text-sm text-white",
        `transition-opacity duration-300 ease-in ${
          visible ? "opacity-100" : "opacity-0"
        }`
      )}
    >
      <span className="mx-auto">{message}</span>
      <Button
        icon="X"
        size="xs"
        variant="link"
        className="m-0 ml-auto p-0 text-white"
        onClick={() => onClose?.(false)}
      />
    </div>
  );
};
export default Banner;
