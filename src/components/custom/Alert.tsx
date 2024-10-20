import { FC } from "react";

import {
  Alert as AlertUI,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import Icon from "./Icon";

interface BannerProps {
  message?: string;
}

const Alert: FC<BannerProps> = ({ message }) => {
  return (
    <AlertUI className=" w-fit h-fit max-w-[500px]">
      <Icon name="Rocket" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </AlertUI>
  );
};
export default Alert;
