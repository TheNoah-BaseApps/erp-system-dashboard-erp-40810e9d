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
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product costs', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;
  
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // Parse request body
    try {
      body = await request.json();
      console.log('Received product cost data:', body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Extract fields - support both field naming conventions
    const product_id = body.product_id || body.productId;
    const cost_amount = body.unit_cost || body.cost_amount || body.costAmount;
    const effective_date = body.month || body.effective_date || body.effectiveDate;

    // Validate required fields
    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!cost_amount && cost_amount !== 0) {
      return NextResponse.json(
        { success: false, error: 'Cost amount is required' },
        { status: 400 }
      );
    }

    if (!effective_date) {
      return NextResponse.json(
        { success: false, error: 'Effective date is required' },
        { status: 400 }
      );
    }

    // Validate cost amount
    const parsedCost = parseFloat(cost_amount);
    if (isNaN(parsedCost)) {
      return NextResponse.json(
        { success: false, error: 'Cost amount must be a valid number' },
        { status: 400 }
      );
    }

    if (parsedCost < 0) {
      return NextResponse.json(
        { success: false, error: 'Cost amount cannot be negative' },
        { status: 400 }
      );
    }

    // Check if product exists
    console.log('Checking if product exists:', product_id);
    const productCheck = await query(
      'SELECT id, product_name FROM products WHERE id = $1',
      [product_id]
    );

    if (!productCheck.rows || productCheck.rows.length === 0) {
      console.error('Product not found:', product_id);
      return NextResponse.json(
        { success: false, error: `Product with ID ${product_id} does not exist` },
        { status: 404 }
      );
    }

    console.log('Product found:', productCheck.rows[0]);

    // Check for duplicate entry
    console.log('Checking for duplicate entry:', { product_id, effective_date });
    const existing = await query(
      'SELECT id FROM product_costs WHERE product_id = $1 AND month = $2',
      [product_id, effective_date]
    );

    if (existing.rows && existing.rows.length > 0) {
      console.error('Duplicate entry found:', existing.rows[0]);
      return NextResponse.json(
        { 
          success: false, 
          error: 'A cost entry already exists for this product and date',
          details: `Product ID: ${product_id}, Date: ${effective_date}`
        },
        { status: 409 }
      );
    }

    // Create cost entry
    console.log('Inserting product cost:', {
      product_id,
      effective_date,
      parsedCost,
      userId: authResult.user.userId
    });

    const result = await query(
      `INSERT INTO product_costs (product_id, month, unit_cost, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, product_id, month, unit_cost, created_at, updated_at`,
      [product_id, effective_date, parsedCost, authResult.user.userId]
    );

    if (!result.rows || result.rows.length === 0) {
      console.error('Insert succeeded but no rows returned');
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve created cost entry' },
        { status: 500 }
      );
    }

    console.log('Product cost created successfully:', result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Product cost created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product cost error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', body);

    // Handle specific database errors
    if (error.code) {
      console.error('Database error code:', error.code);
      
      if (error.code === '23503') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Foreign key constraint violation',
            details: 'Referenced product or user does not exist'
          },
          { status: 400 }
        );
      }
      
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Duplicate entry',
            details: 'A cost entry with these values already exists'
          },
          { status: 409 }
        );
      }

      if (error.code === '23502') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Required field missing',
            details: error.message
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product cost',
        details: error.message
      },
      { status: 500 }
    );
  }
}