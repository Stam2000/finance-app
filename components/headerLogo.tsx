import Link from "next/link";
import Image from "next/image";

export const HeaderLogo =()=>{
    return(
        <Link href="/">
            <div className="items-center hidden  lg:flex">
                <Image src="/next.svg" alt="logo" width={64} height={64} />
            </div>
        </Link>
    )
}