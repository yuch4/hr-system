import { supabase } from './supabase';

const EMPLOYEES_TABLE = 'employees';

export async function initializeDatabase() {
  const { error: tableError } = await supabase.from(EMPLOYEES_TABLE).select('id').limit(1);
  
  if (tableError?.code === 'PGRST204') {
    const { error: createError } = await supabase.rpc('initialize_database');
    if (createError) {
      console.error('Error creating database schema:', createError);
      throw createError;
    }
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(EMPLOYEES_TABLE)
    .select('id')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return !!data;
}

export async function createEmployee(data: {
  name: string;
  email: string;
  company_name: string;
  department: string;
  position: string;
}) {
  // First check if email already exists
  const emailExists = await checkEmailExists(data.email);
  if (emailExists) {
    throw new Error('このメールアドレスは既に登録されています');
  }

  const { data: employee, error } = await supabase
    .from(EMPLOYEES_TABLE)
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('このメールアドレスは既に登録されています');
    }
    throw error;
  }
  
  return employee;
}

export async function getEmployees() {
  const { data, error } = await supabase
    .from(EMPLOYEES_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}