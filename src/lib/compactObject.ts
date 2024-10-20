import { IUnknown } from "@/interface/Iunknown";
import { omitBy } from "lodash";

export function compactObject(object: IUnknown) {
  return omitBy(object, (value) =>
    ['', null, undefined].includes(value),
  );
}