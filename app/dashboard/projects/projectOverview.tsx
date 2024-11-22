'use client'

import { useGetProjects } from '@/features/projects/api/use-get-projects'
import { DataTable} from './data-table'
import { useDeleteProjects } from '@/features/projects/api/use-delete-projects'
import { ReturnColumns } from './columns'

export default function MinimalistProjectOverview() {

  const projectsColumns = ReturnColumns()
  const projectQuery = useGetProjects()
  const projects = projectQuery.data
  const isLoading = projectQuery.isLoading
  const deleteMutation = useDeleteProjects()
  const isDisabled= projectQuery.isLoading || deleteMutation.isPending

  console.log(projectQuery.data)

  
  if(isLoading){
    return(
      <div>
        is Loading
      </div>
    )
  }


  return (
    <>
      <DataTable
                    filterKey='name'
                    columns={projectsColumns}
                    data={projects!}
                    disabled={isDisabled}
                    onDelete={(rows)=>{
                    const ids = rows.map((row)=> row.original.id)
                    deleteMutation.mutate({ids})
                    }}
                />
    </>
  )}