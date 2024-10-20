import { Skeleton } from '@/components/ui/skeleton';
import { FC } from 'react';

interface SkeletonMenusProps {
  lines?: number;
}

const SkeletonMenus: FC<SkeletonMenusProps> = ({ lines = 3}) => {
  return (
    <div className=" mt-4 space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-4 w-3 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
};
export default SkeletonMenus;
