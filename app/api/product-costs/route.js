/**
 * @swagger
 * /api/product-costs:
 *   get:
 *     summary: Get all product costs
 *     tags: [Product Costs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product costs retrieved successfully
 *   post:
 *     summary: Create a new product cost entry
 *     tags: [Product Costs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product cost created successfully
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
      `SELECT pc.id, pc.product_id, pc.month, pc.unit_cost, pc.created_at,
              p.product_name, p.product_code
       FROM product_costs pc
       JOIN products p ON pc.product_id = p.id
       ORDER BY pc.month DESC, p.product_name ASC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get product costs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product costs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id, month, unit_cost } = body;

    // Validate input
    if (!product_id || !month || !unit_cost) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (parseFloat(unit_cost) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Unit cost must be positive' },
        { status: 400 }
      );
    }

    // Check for duplicate entry
    const existing = await query(
      'SELECT id FROM product_costs WHERE product_id = $1 AND month = $2',
      [product_id, month]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cost entry already exists for this product and month' },
        { status: 400 }
      );
    }

    // Create cost entry
    const result = await query(
      `INSERT INTO product_costs (product_id, month, unit_cost, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [product_id, month, unit_cost, authResult.user.userId]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product cost error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product cost' },
      { status: 500 }
    );
  }
}