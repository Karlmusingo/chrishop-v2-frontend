"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { usePathname, useSearchParams, redirect } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function LocationFilter({ depot = true }: { depot?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locations = useQuery(api.functions.locations.list, {}) ?? [];

  const onValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value !== "all") {
      params.set("location", value);
    } else {
      params.delete("location");
    }

    void redirect(`${pathname}?${params.toString()}`);
  };

  const currentLocation = searchParams.get("location")?.toString();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        <RadioGroup
          onValueChange={onValueChange}
          className="flex items-center gap-0"
          defaultValue={currentLocation}
        >
          <div>
            <RadioGroupItem
              value="all"
              id="status-all"
              className="peer sr-only"
            />
            <Label
              htmlFor="status-all"
              className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                !currentLocation
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Tout
            </Label>
          </div>
          {depot && (
            <div>
              <RadioGroupItem
                value="depot"
                id="status-depot"
                className="peer sr-only"
              />
              <Label
                htmlFor="status-depot"
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                  currentLocation === "depot"
                    ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                    : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Depot
              </Label>
            </div>
          )}
          {locations.map((location: any) => (
            <div key={location._id}>
              <RadioGroupItem
                value={location._id}
                id={location._id}
                className="peer sr-only"
              />
              <Label
                htmlFor={location._id}
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                  currentLocation === location._id
                    ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                    : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {location.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
