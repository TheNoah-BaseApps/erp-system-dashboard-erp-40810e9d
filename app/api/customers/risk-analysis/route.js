/**
 * @swagger
 * /api/customers/risk-analysis:
 *   get:
 *     summary: Analyze customers approaching balance risk limits
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Risk analysis retrieved successfully
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

    // Note: This is a simplified version. In a real system, you'd have a balance field
    // and calculate the percentage of balance vs risk limit
    const result = await query(
      `SELECT id, customer_name, customer_code, balance_risk_limit,
              sales_rep, email
       FROM customers
       WHERE balance_risk_limit > 0
       ORDER BY balance_risk_limit DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get risk analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk analysis' },
      { status: 500 }
    );
  }
}