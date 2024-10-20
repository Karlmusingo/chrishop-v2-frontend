// import {
//   MultiSelector,
//   MultiSelectorContent,
//   MultiSelectorInput,
//   MultiSelectorItem,
//   MultiSelectorList,
//   MultiSelectorTrigger,
// } from "@/components/ui/multi-select";
import type * as SelectPrimitive from "@radix-ui/react-select";
import { type FC } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { type Control } from "react-hook-form";

type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps extends SelectPrimitive.SelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  options: OptionType[];
  values: string[];
  onValuesChange: (value: string[]) => void;
}

const MultiSelect: FC<MultiSelectProps> = ({
  onValuesChange,
  options,
  defaultValue,
  values,
  placeholder,
  ...props
}) => {
  return <div />;
  // return (
  //   <MultiSelector
  //     className="w-full"
  //     onValuesChange={onValuesChange}
  //     defaultValue={defaultValue}
  //     values={values}
  //     {...props}
  //   >
  //     <MultiSelectorTrigger className="">
  //       <MultiSelectorInput className="" placeholder={placeholder} />
  //     </MultiSelectorTrigger>
  //     <MultiSelectorContent>
  //       <MultiSelectorList>
  //         {options.map(({ value, label }) => (
  //           <MultiSelectorItem key={value} value={value}>
  //             <div className="flex items-center space-x-2">
  //               <span>{capitalizeFirstLetter(label)}</span>
  //             </div>
  //           </MultiSelectorItem>
  //         ))}
  //       </MultiSelectorList>
  //     </MultiSelectorContent>
  //   </MultiSelector>
  // );
};

export default MultiSelect;
