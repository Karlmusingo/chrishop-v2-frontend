import { FC } from "react";

import { useQueryString } from "@/hooks/useQueryString";

import Button from "../Button";
import { iconType } from "../Icon";

interface AddNewProps {
  label?: string;
  icon?: iconType;
  onClick?: () => void;
}

const AddNew: FC<AddNewProps> = ({
  label = " Add Item",
  icon = "Plus",
  onClick,
}) => {
  const { pushQueryObject } = useQueryString();
  return (
    <Button
      icon={icon}
      onClick={() => {
        pushQueryObject({ context: "new", sheet_opened: "true" });
        onClick?.();
      }}
    >
      {label}
    </Button>
  );
};

export default AddNew;
