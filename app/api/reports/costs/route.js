/**
 * @swagger
 * /api/reports/costs:
 *   get:
 *     summary: Generate cost analysis report
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
      `SELECT pc.id, pc.month, pc.unit_cost, pc.created_at,
              p.product_name, p.product_code, p.product_category, p.brand
       FROM product_costs pc
       JOIN products p ON pc.product_id = p.id
       ORDER BY pc.month DESC, p.product_name`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Generate cost report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate cost report' },
      { status: 500 }
    );
  }
}