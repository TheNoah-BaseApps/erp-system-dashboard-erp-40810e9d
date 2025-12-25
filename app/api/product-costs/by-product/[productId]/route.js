/**
 * @swagger
 * /api/product-costs/by-product/{productId}:
 *   get:
 *     summary: Get cost history for a specific product
 *     tags: [Product Costs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product cost history retrieved successfully
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/database/aurora';

export async function GET(request, { params }) {
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
              p.product_name, p.product_code
       FROM product_costs pc
       JOIN products p ON pc.product_id = p.id
       WHERE pc.product_id = $1
       ORDER BY pc.month ASC`,
      [params.productId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get product cost history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product cost history' },
      { status: 500 }
    );
  }
}