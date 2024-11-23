import { DataFilter } from "./data-filter"
import { AccountFilter } from "./account-filter"
import { DialogProfilForm } from "./dialog-profil-form";
import Link from "next/link";
import {Suspense} from "react"

export const Filter = ()=>{
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center lg:grid-cols-3 gap-x-2 gap-y-2 lg:gap-y-0 lg:gap-x-2" >
            <AccountFilter /> {/* Wrap AccountFilter in Suspense */}
            <DataFilter />
            <Link href="/" >
                <button className="  w-full justify-center px-3 py-2 border  rounded-[2px] font-bold font-nunito bg-white/80 text-slate-700 text-sm flex gap-2 items-center " >
                    Try new profile 
                    <img className="object-cover rounded-xl h-5 "  src={`/sparkles-svgrepo-com.svg`}  alt={"lg.displayName"}/> 
                </button>
            </Link>
            
        </div>
    );
};