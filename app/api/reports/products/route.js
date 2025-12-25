/**
 * @swagger
 * /api/reports/products:
 *   get:
 *     summary: Generate product catalog report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
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

    const result = await query(
      `SELECT id, product_name, product_code, product_category, unit,
              critical_stock_level, brand, created_at, updated_at
       FROM products
       ORDER BY product_category, product_name`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Generate product report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate product report' },
      { status: 500 }
    );
  }
}