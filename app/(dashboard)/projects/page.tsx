"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card"
import { motion } from "framer-motion";
import {Goal,Rocket,Wallet,ChevronUp,ChevronDown} from "lucide-react"
import { Plus,Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useNewProject } from "@/features/projects/hooks/use-new-project";
import { useDeleteProjects } from "@/features/projects/api/use-delete-projects";
import MinimalistProjectOverview from "@/app/(dashboard)/projects/projectOverview";
import { NewProjectDialog } from "@/features/projects/components/new-project-dialog";
import { EditProjectDialog } from "@/features/projects/components/edit-project-dialog";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { DataTable } from '@/app/(dashboard)/transactions/data-table'
import { DataTable as GlobalDataTable} from '@/components/data-table'
import { columns } from "../transactions/columns"
import { detailsColumns } from '@/app/(dashboard)/details/DetailsColumns'




const AccountsPage = ()=>{
    const {isOpen,onOpen} = useNewProject()
    const newProject = useCreateProject()
    const projectsQuery = useGetProjects()
    const deleteProjects = useDeleteProjects()
   const projects =projectsQuery.data || []

   const [showTransactions, setShowTransactions] = useState(false);
  const [showDetailsTransactions, setShowDetailsTransactions] = useState(false);

  // Hardcoded data
  const row = { original:{
    name: "Marketing Campaign Q3 2024",
    budget: 100000, // in dollars
    spent: 67500, // in miliunits (67,500 dollars)
    transactions: [
      { id: 1, date: "2024-07-01", description: "Social Media Ads", amount: 15000000 },
      { id: 2, date: "2024-07-15", description: "Influencer Partnership", amount: 25000000 },
      { id: 3, date: "2024-08-01", description: "Content Creation", amount: 10000000 },
      { id: 4, date: "2024-08-15", description: "Email Marketing", amount: 7500000 },
      { id: 5, date: "2024-09-01", description: "SEO Optimization", amount: 10000000 },
    ],
    detailsTransactions: [
      { id: 1, name: "Facebook Ads", platform: "Facebook", amount: 8000000, impressions: 500000, clicks: 25000 },
      { id: 2, name: "Instagram Ads", platform: "Instagram", amount: 7000000, impressions: 400000, clicks: 20000 },
      { id: 3, name: "YouTube Ads", platform: "YouTube", amount: 12000000, impressions: 300000, clicks: 15000 },
      { id: 4, name: "LinkedIn Ads", platform: "LinkedIn", amount: 5000000, impressions: 100000, clicks: 5000 },
      { id: 5, name: "TikTok Ads", platform: "TikTok", amount: 3500000, impressions: 200000, clicks: 10000 },
    ]
  }
    
  };

  const percentageSpent = (row.original?.spent / row.original?.budget) * 100
  const filters = ["payee","category","account"]


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
        <div className="flex-1 w-full" >
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