import { FC, PropsWithChildren } from 'react';

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sheet as SheetUI,
} from '@/components/ui/sheet';

interface SheetProps extends PropsWithChildren {
  open: boolean;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

const Sheet: FC<SheetProps> = ({ open, title, description, trigger, children, onClose }) => {
  return (
    <SheetUI open={open} onOpenChange={onClose}>
      {!!trigger && <SheetTrigger>{trigger}</SheetTrigger>}
      <SheetContent className="w-[480px] py-10 sm:max-w-[480px]">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-center">{title} </SheetTitle>

          <SheetDescription className='px-6 text-center'>{description}</SheetDescription>
        </SheetHeader>
        <div>{children}</div>
      </SheetContent>
    </SheetUI>
  );
};
export default Sheet;
