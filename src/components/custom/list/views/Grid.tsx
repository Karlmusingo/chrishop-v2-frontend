import { FC, ReactElement } from 'react';
import { IUnknown } from '@/interface/Iunknown';
import { isEmpty } from 'lodash';

import { cn } from '@/lib/utils';

import { Card } from '@/components/ui/card';
import Empty from '@/components/Empty';

import SkeletonMenusCard from '../../Skeletons/SkeletonMenusCard';
import ListFilter, { TableFilterProps } from '../Filter';


export interface GridViewSections<TData> {
  section: 'top' | 'bottom' | 'center';
  render: (data: TData) => JSX.Element;
}

interface GridViewProps {
  sections: GridViewSections<{ data: IUnknown }>[];
  data: IUnknown[];
  state: { loading: boolean; error?: string };
  filter: TableFilterProps;
  containerClassName?: string | undefined;
  action?: ReactElement;
}

const GridView: FC<GridViewProps> = ({
  sections,
  data,
  state,
  containerClassName,
  filter: { options, filterKey },
  action,
}) => {
  return (
    <div>
      <ListFilter
        options={{ combobox: options?.combobox }}
        filterKey={filterKey}
        type="combobox"
        hasPagination
        action={action}
      />
      {state.loading ? (
        <SkeletonMenusCard n={10} />
      ) : isEmpty(data) ? (
        <Empty />
      ) : (
        <div className="flex gap-2">
          {data?.map((item, index) => (
            <Card
              key={index}
              className={cn('flex flex-col', containerClassName)}
            >
              {sections.map((section) => section.render({ data: item }))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default GridView;
