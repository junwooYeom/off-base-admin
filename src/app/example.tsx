import { supabase } from '@/lib/supabase'

// 데이터 조회 예시
async function fetchData() {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Data:', data)
}

// 데이터 삽입 예시
async function insertData() {
  const { data, error } = await supabase
    .from('your_table')
    .insert([
      { column1: 'value1', column2: 'value2' }
    ])
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Inserted:', data)
} 