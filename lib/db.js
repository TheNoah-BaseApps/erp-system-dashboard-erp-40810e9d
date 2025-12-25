// This file provides a unified interface for database operations
// It wraps the Aurora database connection from lib/database/aurora

import { query as auroraQuery, getClient as auroraGetClient } from '@/lib/database/aurora';

/**
 * Execute a database query
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export async function query(sql, params = []) {
  try {
    return await auroraQuery(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
}

/**
 * Get a database client for transactions
 * @returns {Promise} Database client
 */
export async function getClient() {
  try {
    return await auroraGetClient();
  } catch (error) {
    console.error('Database client error:', error);
    throw new Error('Failed to get database client');
  }
}

/**
 * Execute a transaction
 * @param {Function} callback - Transaction callback function
 * @returns {Promise} Transaction result
 */
export async function transaction(callback) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if a record exists
 * @param {string} table - Table name
 * @param {string} column - Column name
 * @param {any} value - Value to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
export async function recordExists(table, column, value) {
  try {
    const result = await query(
      `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${column} = $1) as exists`,
      [value]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error('Record exists check error:', error);
    return false;
  }
}