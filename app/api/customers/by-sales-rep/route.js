/**
 * @swagger
 * /api/customers/by-sales-rep:
 *   get:
 *     summary: Group customers by sales representative
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers grouped by sales rep successfully
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
      `SELECT sales_rep, COUNT(*) as customer_count,
              ARRAY_AGG(customer_name ORDER BY customer_name) as customers
       FROM customers
       WHERE sales_rep IS NOT NULL AND sales_rep != ''
       GROUP BY sales_rep
       ORDER BY sales_rep`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get customers by sales rep error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers by sales rep' },
      { status: 500 }
    );
  }
}