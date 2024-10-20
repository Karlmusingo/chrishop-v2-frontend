import { FC } from "react";
import { IUnknown } from "@/interface/Iunknown";
import { CldImage, CldUploadWidget } from "next-cloudinary";

import Button from "./Button";
import Icon from "./Icon";
import { isArray } from "lodash";

interface UploadImageProps {
  values?: string[];
  disabled?: boolean;
  onChange?: (url: string[]) => void;
  onRemove?: (url: string) => void;
  multipleFiles?: boolean;
  includeId?: boolean; // used to add cloudinary public_id to the url [public_id, url]
}

const UploadImage: FC<UploadImageProps> = ({
  values,
  disabled,
  onChange,
  onRemove,
  multipleFiles = true,
  includeId = true,
}) => {
  // TODO: instead of using values to display a thumbnail, use the result.info.thumbnail_url from the upload widget ( it is smaller and faster to load)
  const onUpload = (result: IUnknown) => {
    if (!includeId) return onChange?.(result.info.secure_url);
    onChange?.([`${result.info.public_id}, ${result.info.secure_url}`]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {(isArray(values) ? values : [values])?.map((url = "") => {
          const [public_id, full_url] = url?.split(",");
          return (
            !!url && (
              <div
                key={url}
                className="relative h-[100px] w-[100px] overflow-hidden rounded-md"
              >
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    type="button"
                    icon="Trash"
                    onClick={() => onRemove?.(url)}
                    variant="destructive"
                    size="xs"
                  />
                </div>
                <CldImage
                  width={200}
                  height={200}
                  crop="fill"
                  src={public_id}
                  alt="billboard image"
                />
              </div>
            )
          );
        })}
      </div>
      <CldUploadWidget
        uploadPreset="b1fmsqmw"
        onUpload={onUpload}
        options={{
          sources: ["local", "unsplash", "image_search", "google_drive", "url"],
          multiple: multipleFiles,
        }}
      >
        {({ open }) => {
          return (
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                open();
              }}
              className="flex h-auto w-full flex-col border border-dashed p-4"
            >
              <div className=" rounded-lg border px-2 py-1">
                <Icon name="CloudUpload" size="22" />
              </div>
              <p className="font-semibold text-primary-light">
                Click to upload
              </p>
              <p>SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default UploadImage;
