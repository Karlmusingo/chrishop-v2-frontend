import { FC, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="font-serif text-[28px] font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;
