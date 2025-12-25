/**
 * @swagger
 * /api/reports/customers:
 *   get:
 *     summary: Generate customer analysis report
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
      `SELECT id, customer_name, customer_code, address, city_or_district,
              sales_rep, country, region_or_state, telephone_number, email,
              contact_person, payment_terms_limit, balance_risk_limit,
              created_at, updated_at
       FROM customers
       ORDER BY sales_rep, customer_name`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Generate customer report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate customer report' },
      { status: 500 }
    );
  }
}