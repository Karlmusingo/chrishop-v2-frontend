import React, { FC } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { ButtonUI, ButtonUIProps } from "../ui/button";
import Icon, { iconType } from "./Icon";

interface ButtonProps extends ButtonUIProps {
  loading?: boolean;
  icon?: iconType;
  iconPosition?: "left" | "right";
}
const Button: FC<ButtonProps> = ({
  loading = false,
  icon,
  size = "sm",
  iconPosition = "left",
  children,
  ...props
}) => {
  return (
    <ButtonUI disabled={loading} size={size} {...props}>
      {loading && <Loader2 className=" mr-1 h-4 w-4 animate-spin" />}
      <div
        className={cn("flex   items-center gap-2", {
          "flex-row-reverse": iconPosition === "right",
        })}
      >
        {icon && <Icon name={icon} />}
        {children}
      </div>
    </ButtonUI>
  );
};

export default Button;
