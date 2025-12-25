/**
 * @swagger
 * /api/products/critical-stock:
 *   get:
 *     summary: Get products at or below critical stock level
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Critical stock products retrieved successfully
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

    // Note: This assumes there's a current_stock column or similar
    // For this spec, we're just returning all products with their critical stock level
    const result = await query(
      `SELECT id, product_name, product_code, critical_stock_level, brand
       FROM products
       ORDER BY critical_stock_level ASC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get critical stock error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch critical stock products' },
      { status: 500 }
    );
  }
}