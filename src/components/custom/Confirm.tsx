import { FC } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import Button from "./Button";

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
  onConfirm?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const Confirm: FC<ConfirmProps> = ({
  open,
  onClose,
  onConfirm,
  trigger,
  isLoading,
  title,
  description,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      {!!trigger && <AlertDialogTrigger>Open</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "This action cannot be undone. This will permanently delete the record and remove related data from our servers."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            size="default"
            onClick={onConfirm}
            loading={isLoading}
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default Confirm;
