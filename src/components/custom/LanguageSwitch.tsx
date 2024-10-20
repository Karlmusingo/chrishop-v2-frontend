import { FC } from 'react';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  Select as SelectUI,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

interface LanguageSwitchProps {}

const LanguageSwitch: FC<LanguageSwitchProps> = () => {
  const router = useRouter();

  const handleLanguageSwitch = (value: string) => {
    document.cookie = `lang=${value};path=/`;
    console.log('here cookies', document.cookie)
    router.refresh();
  };

  return (
    <div>
      <SelectUI onValueChange={handleLanguageSwitch} defaultValue='fr'>
        <SelectTrigger className="w-[70px] h-[30px] rounded-lg shadow-sm">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className='w-[60px] max-w-[30px]'>
          <SelectItem value="fr"><Icon url='bienfafood/french' /></SelectItem>
          <SelectItem value="en"><Icon url='bienfafood/english' /></SelectItem>
        </SelectContent>
      </SelectUI>
    </div>
  );
};
export default LanguageSwitch;
