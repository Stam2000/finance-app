import { DataFilter } from "./data-filter"
import { AccountFilter } from "./account-filter"


export const Filter = ()=>{
    return (
        <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-x-2 gap-y-2 lg:gap-y-0 lg:gap-x-2" >
            <AccountFilter />
            <DataFilter />
        </div>
    );
};