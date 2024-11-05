"use client"

import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { usePathname,useRouter } from "next/navigation"
import { NavButton } from "./nav-button"
import { useMedia } from "react-use"
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet"
import { useState } from "react"

const routes =[{
href:"/",
label:"Overview"
},{
    href:"/transactions",
    label:"Transactions"
},{
    href:"/accounts",
    label:"Accounts"
},{
    href:"/categories",
    label:"Categories"
},
{
    href:"/details",
    label:"Details"
},
{
    href:"/projects",
    label:"Projects"
}
]

export const Navigation = ()=>{
    const [isOpen,setIsOpen] = useState(false)
    const pathName= usePathname()
    const isMobile= useMedia("(max-width:1024px)",false)
    const router = useRouter()

    const onClick = (href:string )=>{
        router.push(href)
        setIsOpen(false)
    }

    if(isMobile){
        return(
            <Sheet open={isOpen} onOpenChange={setIsOpen} >
                <SheetTrigger>
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-normal focus:bg-white/30 focus-visible:ring-offset-0 focus-visible:ring-transparent transition border-none bg-white/10 hover:bg-white/20 text-white hover:text-white outline-none "
                    >
                        <Menu className="size-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="px-2" >
                    <nav className="flex flex-col gap-y-2 pt-6" >
                            {
                            routes.map((route)=>(
                                <Button
                                key={route.href}
                                variant={route.href === pathName ? "secondary":"ghost"}
                                onClick={()=>onClick(route.href)}
                                >
                                    {route.label}
                                </Button>
                            ))}
                    </nav>
            </SheetContent>
            </Sheet>
            
        )
    }

    return(
        <nav className="hidden lg:flex items-center overflow-x-auto gap-x-2" >

            {routes.map((route)=>(
                <NavButton 
                    key={route.href}
                    href={route.href}
                    label={route.label}
                    isActive={pathName===route.href}
                />
            ))}
           
        </nav>
    )
}