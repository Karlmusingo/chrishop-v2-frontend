import { IUnknown } from "@/interface/Iunknown";
import { compactObject } from "../compactObject";
import { comboboxOptionsType } from "@/components/custom/list/Combobox";
import { capitalize, lowerCase } from "lodash";

const formatComboOptions = (options: IUnknown[]) => {
  return options?.map((option) => {
    return compactObject({
      label: capitalize(option.name),
      value: lowerCase( option.name),
      icon: option.icon,
      image: option.image,
    }) as comboboxOptionsType;
  });
}

export default formatComboOptions;