import { FC, forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { InputUIProps } from '../../ui/input';
import Icon from '../Icon';

export interface InputAmountProps extends InputUIProps {}

const InputAmount: FC<InputAmountProps> = forwardRef<
  HTMLInputElement,
  InputUIProps
>(({ className, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(event.target.value);
    if (props?.onChange) {
      props?.onChange({
        ...event,
        target: {
          ...event.target,
          value: numericValue as any,
        },
      });
    }
  };

  return (
    <div
      className={cn(
        'flex h-9 items-center rounded-md border bg-white pl-3 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      <Icon name="DollarSign" className="h-[16px] w-[16px]" />
      <input
        {...props}
        type="number"
        placeholder="00.00"
        ref={ref}
        onChange={handleChange}
        className="w-full bg-transparent p-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
});

InputAmount.displayName = 'InputAmount';

export default InputAmount;
