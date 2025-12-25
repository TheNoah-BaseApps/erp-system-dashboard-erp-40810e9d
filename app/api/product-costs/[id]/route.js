/**
 * @swagger
 * /api/product-costs/{id}:
 *   get:
 *     summary: Get product cost by ID
 *     tags: [Product Costs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product cost retrieved successfully
 *   put:
 *     summary: Update product cost
 *     tags: [Product Costs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product cost updated successfully
 *   delete:
 *     summary: Delete product cost
 *     tags: [Product Costs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product cost ID
 *     responses:
 *       200:
 *         description: Product cost deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Product cost not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to delete product cost
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
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
      'SELECT * FROM product_costs WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get product cost error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product cost' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { unit_cost, month } = body;

    if (parseFloat(unit_cost) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Unit cost must be positive' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE product_costs 
       SET unit_cost = $1, month = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [unit_cost, month, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update product cost error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product cost' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { id } = params;

    const result = await query(
      'DELETE FROM product_costs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Delete product cost error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product cost' },
      { status: 500 }
    );
  }
}