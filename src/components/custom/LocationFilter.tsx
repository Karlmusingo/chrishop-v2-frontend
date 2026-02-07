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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <RadioGroup
            onValueChange={onValueChange}
            className="flex items-center gap-2"
            defaultValue={searchParams.get("location")?.toString()}
          >
            <div>
              <RadioGroupItem
                value="all"
                id="status-all"
                className="peer sr-only"
              />
              <Label
                htmlFor="status-all"
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 [&:has(:checked)]:bg-muted ${
                  !searchParams.get("location")?.toString() ? "bg-muted" : ""
                }`}
              >
                All
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
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 [&:has(:checked)]:bg-muted ${
                    searchParams.get("location")?.toString() === "depot"
                      ? "border-primary bg-muted"
                      : ""
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
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 [&:has(:checked)]:bg-muted ${
                    searchParams.get("location")?.toString() === location._id
                      ? "border-primary bg-muted"
                      : ""
                  }`}
                >
                  {location.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
