import { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ButtonUI } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface ModalProps {
  triggerContent?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  trigger?: ReactNode;
  isOpened: boolean;
  onClose: () => void;
  classNames?: { title: string; description: string; container?: string };
}

const Modal: FC<ModalProps> = ({
  triggerContent,
  trigger,
  title,
  description,
  children,
  isOpened,
  onClose,
  classNames,
}) => {
  return (
    <div>
      <Dialog open={isOpened} onOpenChange={onClose}>
        {!!triggerContent ? (
          <DialogTrigger asChild>
            <ButtonUI variant="outline">{triggerContent}</ButtonUI>
          </DialogTrigger>
        ) : (
          trigger
        )}
        <DialogContent
          className={cn("sm:max-w-[525px]", classNames?.container)}
        >
          <DialogHeader>
            <DialogTitle className={classNames?.title}>{title}</DialogTitle>
            <DialogDescription className={classNames?.description}>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Modal;
