import { FC } from "react";

import { Input as InputComponent, InputUIProps } from "../../ui/input";

export interface InputPhoneProps extends InputUIProps {}

const InputPhone: FC<InputPhoneProps> = ({ ...props }) => {
  const defaultValue = ((props.defaultValue as string) || "").replace(
    "+243",
    ""
  );
  const value = ((props.value as string) || "").replace("+243", "");

  return (
    <div className="flex">
      <div className="-mr-1 flex h-10 items-center gap-1 rounded-l-lg bg-slate-200 px-2 text-sm font-semibold text-slate-600">
        <span className=" text-lg">🇷🇼</span>
        <span>+250</span>
      </div>
      <InputComponent
        {...props}
        value={value}
        defaultValue={defaultValue}
        placeholder="eg: 87.."
        maxLength={9}
      />
    </div>
  );
};

export default InputPhone;
