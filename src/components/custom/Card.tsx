import { FC } from "react";

import { cn } from "@/lib/utils";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as CardUI,
} from "@/components/ui/card";

interface CardProps extends React.ComponentProps<typeof CardUI> {
  title?: string;
  description?: string;
}

const Card: FC<CardProps> = ({
  title,
  description,
  className,
  children,
  ...props
}) => {
  return (
    <CardUI className={cn("w-[380px]", className)} {...props}>
      <CardHeader className="p-5 pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-5">{children}</CardContent>
    </CardUI>
  );
};
export default Card;
