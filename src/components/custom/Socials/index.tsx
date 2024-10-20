import * as React from "react";
import Link from "next/link";
import Image from "next/image";

const Socials: React.FunctionComponent<{ width?: number }> = ({ width }) => {
  const imageWidth = width || 24;

  return (
    <div className="flex space-x-4">
      <Link
        href="https://www.facebook.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/assets/socials/linkedin.svg"
          alt="Facebook"
          className="object-contain cursor-pointer"
          width={imageWidth}
          height={imageWidth}
        />
      </Link>
      <Link
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/assets/socials/instagram.svg"
          alt="Instagram"
          className="object-contain cursor-pointer"
          width={imageWidth}
          height={imageWidth}
        />
      </Link>
      <Link
        href="https://www.facebook.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/assets/socials/facebook.svg"
          alt="Facebook"
          className="object-contain cursor-pointer"
          width={imageWidth}
          height={imageWidth}
        />
      </Link>
      <Link
        href="https://twitter.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/assets/socials/twitter.svg"
          alt="Twitter"
          className="object-contain cursor-pointer"
          width={imageWidth}
          height={imageWidth}
        />
      </Link>

      <Link
        href="https://www.youtube.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/assets/socials/youtube.svg"
          alt="Youtube"
          className="object-contain cursor-pointer"
          width={imageWidth}
          height={imageWidth}
        />
      </Link>
    </div>
  );
};

export default Socials;
