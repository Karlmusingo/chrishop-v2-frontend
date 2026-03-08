import { FC } from "react";

type SizeOption = { value: string };
type SizeEntry = { size: string; quantity: number };

interface SizeDistributionGridProps {
  sizes: SizeOption[];
  values: SizeEntry[];
  onChange: (index: number, size: string, quantity: number) => void;
}

const SizeDistributionGrid: FC<SizeDistributionGridProps> = ({
  sizes,
  values,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Distribution par taille</label>
      <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-3">
        {sizes.map((size, index) => (
          <div key={size.value} className="flex items-center gap-2">
            <label className="w-12 text-sm font-medium">{size.value}</label>
            <input
              type="number"
              min={0}
              className="h-9 w-full rounded-md border px-2 text-sm"
              value={values[index]?.quantity ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onChange(index, size.value, val);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizeDistributionGrid;
