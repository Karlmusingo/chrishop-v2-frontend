"use client";
import { FC, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input as InputComponent, InputUIProps } from "../../ui/input";

const PasswordInput: FC<{ placeholder?: string; field: any } & InputUIProps> = ({
  placeholder,
  field,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <InputComponent
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="pr-10"
        {...field}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
