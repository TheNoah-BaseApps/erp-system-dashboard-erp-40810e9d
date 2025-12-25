/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/database/aurora';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // Get total products
    const productsResult = await query('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count);

    // Get critical stock products (simplified - in real system would compare with current stock)
    const criticalStockResult = await query(
      'SELECT COUNT(*) as count FROM products WHERE critical_stock_level > 0'
    );
    const criticalStockProducts = parseInt(criticalStockResult.rows[0].count);

    // Get total customers
    const customersResult = await query('SELECT COUNT(*) as count FROM customers');
    const totalCustomers = parseInt(customersResult.rows[0].count);

    // Get at-risk customers (simplified)
    const atRiskResult = await query(
      'SELECT COUNT(*) as count FROM customers WHERE balance_risk_limit > 0'
    );
    const atRiskCustomers = parseInt(atRiskResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        criticalStockProducts,
        totalCustomers,
        atRiskCustomers,
      },
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}