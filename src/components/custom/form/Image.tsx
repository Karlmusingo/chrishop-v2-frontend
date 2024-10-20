import { FC } from 'react';
import { Control } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input as InputComponent, InputUIProps } from '../../ui/input';
import UploadImage from '../UploadImage';

interface ImageFieldProps extends InputUIProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  multipleFiles?: boolean;
  includeId?: boolean;
}

const ImageField: FC<ImageFieldProps> = ({
  control,
  name,
  label,
  description,
  multipleFiles,
  includeId,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <UploadImage
              values={field.value}
              onChange={(url) => {
                if (!multipleFiles) {
                  return field.onChange(url);
                }
                field.onChange([
                  ...(field.value?.length ? field.value : []),
                  ...url,
                ]);
              }}
              onRemove={(url) => {
                const newValues = field.value.filter(
                  (item: string) => item !== url
                );
                field.onChange(newValues);
              }}
              includeId={includeId}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageField;
