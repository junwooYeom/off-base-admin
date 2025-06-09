import { supabase } from '@/lib/supabase'
import { Property } from '@/types'
import PropertiesTable from './PropertiesTable.tsx'

async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Property[]
}

export default async function PropertiesPage() {
  const properties = await getProperties()

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">매물 관리</h2>
        <div className="mt-4">
          <PropertiesTable properties={properties}/>
        </div>
      </div>
    </div>
  )
}
