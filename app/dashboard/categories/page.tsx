"use client"

import {useNewCategory } from "@/features/categories/hooks/use-new-category"
import { useGetCategories } from "@/features/categories/api/use-get-categories";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card"
import { Plus,Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { use, useState } from "react";
import { useGetCategoriesAll } from "@/features/categories/api/use-get-categories-all";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useDeleteCategories } from "@/features/categories/api/use-delete-categories";
import { all } from "axios";




const CategoriesPage = ()=>{
   const [showAllCategories,setShowAllCategories] = useState(false)
    
    const newCategory = useNewCategory()
    const categoriesQuery = useGetCategories()
    const deleteCategories = useDeleteCategories()
    const allCategoriesQuery = useGetCategoriesAll()
   const categories =showAllCategories ? allCategoriesQuery.data || [] : categoriesQuery.data || []
   
   
   const toggleAllshowCategories = ()=>{
    setShowAllCategories(!showAllCategories)
   }

   if(categoriesQuery.isLoading){
    return(
        <div className="max-w-2xl mx-auto w-full" >
            <Card className="border-none drop-shadow-sm" >
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="h-[500px] w-full flex items-center justify-center">
                        <Loader2 className="size-6 text-slate-300 animate-spin"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
   }
    return(
        <div className="max-w-screen-2xl flex-1 mx-auto w-full mb-10 " >
            <Card className="border-none drop-shadow-sm" >
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between" >
                    <CardTitle className="text-xl line-clamp-1" >
                        Categories
                    </CardTitle>
                    <div className="flex gap-2" >
                        <Button onClick={toggleAllshowCategories} size="sm">
                            List All Categories
                        </Button> 
                       <Button onClick={newCategory.onOpen} size="sm">
                            <Plus className="size-4 mr-2"  />
                            Add New
                        </Button>
                    </div>   
                </CardHeader>
                <CardContent>
                    <DataTable filterKey="name" columns={columns} 
                    onDelete={(row)=>{
                        const ids = row.map((r)=> r.original.id);
                        deleteCategories.mutate({ids});
                    }}
                    data={categories}/>
                </CardContent>
            </Card>
        </div>
    )
}

export default CategoriesPage;