import { FC } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonMenusCardProps {
  n?: number;
}

const SkeletonMenusCard: FC<SkeletonMenusCardProps> = ({ n = 3 }) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-[13rem] w-[12rem] p-2 flex flex-col shadow rounded-md">
          <Skeleton className="h-[120px] w-full rounded-t-md" />
          <Skeleton className="h-4 w-28 px-2 my-2" />
          <div className="mt-auto flex justify-between px-2 py-0">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default SkeletonMenusCard;
