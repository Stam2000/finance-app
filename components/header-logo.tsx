import Link from "next/link";
import Image from "next/image";

export const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="items-center hidden  lg:flex">
        <Image src="/logowhite.png" alt="logo" width={80} height={80} />
      </div>
    </Link>
  );
};
