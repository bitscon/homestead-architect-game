#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
const envFile = process.env.SUPABASE_ENV_FILE || '.env.prod';
config({ path: envFile });

// Required tables for Homestead Architect
const REQUIRED_TABLES = [
  'profiles',
  'animals', 
  'animal_health',
  'breeding_events',
  'crops',
  'crop_plantings',
  'finance_transactions',
  'finance_categories',
  'goals',
  'infrastructure',
  'inventory_items',
  'journal_entries',
  'properties',
  'tasks',
  'user_achievements',
  'game_sessions',
  'leaderboard_entries'
];

// Optional views that enhance functionality
const OPTIONAL_VIEWS = [
  'animal_summary',
  'crop_rotation_calendar',
  'financial_summary',
  'task_overview'
];

function log(status, message, details = null) {
  const timestamp = new Date().toISOString();
  let output = `[${timestamp}] [${status}] ${message}`;
  if (details) {
    output += `\n  Details: ${JSON.stringify(details, null, 2)}`;
  }
  console.log(output);
}

async function checkTable(supabase, tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { exists: false, error: 'Table does not exist' };
      }
      return { exists: false, error: error.message };
    }
    
    return { exists: true, count: data?.length || 0 };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkView(supabase, viewName) {
  try {
    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { exists: false, error: 'View does not exist' };
      }
      return { exists: false, error: error.message };
    }
    
    return { exists: true, count: data?.length || 0 };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function validateSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('ERROR', 'Missing Supabase configuration', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    });
    process.exit(1);
  }
  
  log('INFO', 'Validating Supabase connection and schema', {
    url: supabaseUrl,
    keyType: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'
  });
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    log('OK', 'Supabase connection successful');
  } catch (err) {
    log('ERROR', 'Failed to connect to Supabase', { error: err.message });
    process.exit(1);
  }
  
  // Check required tables
  log('INFO', 'Checking required tables...');
  let missingTables = 0;
  const missingTableNames = [];
  
  for (const tableName of REQUIRED_TABLES) {
    const result = await checkTable(supabase, tableName);
    if (result.exists) {
      log('OK', `Table '${tableName}' exists`, { rows: result.count });
    } else {
      log('MISSING', `Table '${tableName}' missing`, { error: result.error });
      missingTables++;
      missingTableNames.push(tableName);
    }
  }
  
  // Check optional views
  log('INFO', 'Checking optional views...');
  let missingViews = 0;
  
  for (const viewName of OPTIONAL_VIEWS) {
    const result = await checkView(supabase, viewName);
    if (result.exists) {
      log('OK', `View '${viewName}' exists`, { rows: result.count });
    } else {
      log('MISSING', `View '${viewName}' missing (optional)`, { error: result.error });
      missingViews++;
    }
  }
  
  // Summary
  const totalTables = REQUIRED_TABLES.length;
  const foundTables = totalTables - missingTables;
  
  log('INFO', 'Validation complete', {
    requiredTables: `${foundTables}/${totalTables}`,
    optionalViews: `${OPTIONAL_VIEWS.length - missingViews}/${OPTIONAL_VIEWS.length}`,
    environment: envFile
  });
  
  if (missingTables > 0) {
    log('ERROR', `${missingTables} required tables are missing`, {
      missing: missingTableNames
    });
    process.exit(1);
  }
  
  log('OK', 'All required tables exist - Supabase is ready for production');
}

// Run validation
validateSupabase().catch(err => {
  log('ERROR', 'Validation failed', { error: err.message });
  process.exit(1);
});