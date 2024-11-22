"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"

import { Plus,Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useNewProject } from "@/features/projects/hooks/use-new-project";
import MinimalistProjectOverview from "./projectOverview";
import { NewProjectDialog } from "@/features/projects/components/new-project-dialog";
import { EditProjectDialog } from "@/features/projects/components/edit-project-dialog";


const AccountsPage = ()=>{
    const {isOpen,onOpen} = useNewProject()
    const projectsQuery = useGetProjects()




   if(projectsQuery.isLoading){
    return(
      <div className=" max-w-screen-2xl mx-auto w-full pb-10">
      <Card className="border-none drop-shadow-sm" >
          <CardHeader>
              <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
              <div className="h-[500px] flex items-center justify-center" >
                  <Loader2 className="size-4 text-slate-300 animate-spin"/>
              </div>
          </CardContent>
      </Card>
  </div>
    )
   }
    return(
        <>
        <NewProjectDialog />
        <EditProjectDialog />
        <div className="flex-1 w-full mb-10" >
            <Card className="border-none drop-shadow-sm" >
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between" >
                    <CardTitle className="text-xl line-clamp-1" >
                        Project
                    </CardTitle>
                    <Button onClick={onOpen} size="sm">
                        <Plus className="size-4 mr-2"  />
                        Add New
                    </Button>
                </CardHeader>
                <CardContent>
                <MinimalistProjectOverview/>
                </CardContent>
            </Card>
        </div>
        </>
    )
}

export default AccountsPage;