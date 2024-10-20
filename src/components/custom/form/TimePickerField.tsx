import { FC } from 'react';
import {
  getLocalTimeZone,
  parseAbsolute,
  parseAbsoluteToLocal,
} from '@internationalized/date';
import { useDateFormatter } from 'react-aria';
import { Control } from 'react-hook-form';

import { Textarea } from '@/components/ui/textarea';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input as InputComponent, InputUIProps } from '../../ui/input';
import { TimePicker } from '../date-time/TimePicker';
import { InputProps } from './Input';

interface TimePickerFieldProps extends InputProps {}


// TODO: Finish this component
// - ref: https://github.com/shadcn-ui/ui/issues/255
// - or just implement with select like ant design

const TimePickerField: FC<InputProps> = ({
  control,
  name,
  label,
  description,
}) => {
  const formatter = useDateFormatter({ dateStyle: 'full' });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <TimePicker
              {...field}
              value={
                !!field.value
                  ? parseAbsolute(field.value.toISOString(), getLocalTimeZone())
                  : null
              }
              onChange={(date: any) => {
                field.onChange(!!date ? date?.toDate(getLocalTimeZone()) : new Date());
              }}
            />
          </FormControl>
          {!!description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimePickerField;
