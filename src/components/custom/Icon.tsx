import { FC, HTMLAttributes } from "react";
import { icons } from "lucide-react";
import { CldImage } from "next-cloudinary";

import isUrl from "@/lib/isUrl";

export type iconType = keyof typeof icons;

interface IconProps extends HTMLAttributes<HTMLOrSVGElement> {
  name?: iconType;
  color?: string;
  size?: string;
  url?: string;
}

const Icon: FC<IconProps> = ({ name, color, size = 16, url, ...props }) => {
  if (url) {
    return (
      <CldImage
        width={16}
        height={16}
        crop="fill"
        src={url}
        alt={url}
        {...props}
      />
    );
  }

  if (!name) return null;
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} {...props} />;
};

export default Icon;
