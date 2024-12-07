
import { HeaderLogo } from "./header-logo"
import { Navigation } from "./navigation"
import { WelcomeMsg } from "./welcoe-msg"
import { Filter } from "./filter" 

import WeekResult from "./week-resume"

import Carousel from "./caroussel"
import GoalOverview from "./goaloverview"


const Header=()=>{


    return(
        <header className="relative  bg-gradient-to-br md:bg-gradient-to-r from-indigo-700 from-10% via-sky-500 via-50% to-emerald-500 to-90% px-8 lg:px-16 py-8 pb-36">
            <div className="max-w-screen-2xl mx-auto">
                <div className="w-full  flex items-center justify-between mb-14">
                   <div className="flex items-center  justify-end lg:gap-x-32 " >
                        <HeaderLogo/>
                        <Navigation />
                   </div>
                </div>
                <div className="flex w-full flex-col  gap-8 lg:gap-2 lg:flex-row items-stretch sm:justify-center justify-between ">
                    <div className="w-full lg:flex-1 items-stretch justify-stretch" >
                        <WelcomeMsg/>
                        <Filter/>
                    </div> 
                    <div className=" w-full lg:flex-1 flex justify-center lg:justify-end mr-5">
                        <div className="w-full lg:-mt-12 md:max-w-[500px] ">
                        <Carousel elements={[
                                { jsx: <GoalOverview />, title: "Spending Overview" },
                                { jsx: <WeekResult />, title: "Weekly Review" },
                            ]}
                            />
                        </div>
                    </div>
                    </div> 
                </div>
               
               {/* { chatOpen && <Chat /> } */} 
            
        </header>
    )
}


export default Header