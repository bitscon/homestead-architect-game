import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_point: number;
  created_at: string;
}

export interface InventoryItemInsert {
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_point: number;
}

export interface InventoryItemUpdate {
  name?: string;
  category?: string;
  current_stock?: number;
  unit?: string;
  reorder_point?: number;
}

export async function getInventory(userId: string) {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as InventoryItem[];
}

export async function getInventoryItem(id: string, userId: string) {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function createInventoryItem(userId: string, item: InventoryItemInsert) {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      ...item,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function updateInventoryItem(id: string, userId: string, item: InventoryItemUpdate) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(item)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function deleteInventoryItem(id: string, userId: string) {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export function isLowStock(item: InventoryItem): boolean {
  return item.current_stock <= item.reorder_point;
}
