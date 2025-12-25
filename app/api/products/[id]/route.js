/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
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
 *         description: Product retrieved successfully
 *   put:
 *     summary: Update product
 *     tags: [Products]
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
 *         description: Product updated successfully
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to delete product
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
      'SELECT * FROM products WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
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
    const {
      product_name,
      product_code,
      product_category,
      unit,
      critical_stock_level,
      brand,
      hsn_code,
      description,
      gst_percent,
      sales_price,
      opening_stock,
      opening_stock_value,
      current_stock,
      low_stock_alert_qty,
      reorder_qty,
      location,
      rack_number,
      product_image,
      supplier_name,
      supplier_code,
      product_status,
      tax_preference,
      exemption_reason,
      intra_state_tax_rate,
    } = body;

    // Validate input
    if (critical_stock_level && parseFloat(critical_stock_level) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Critical stock level must be positive' },
        { status: 400 }
      );
    }

    // Update product
    const result = await query(
      `UPDATE products 
       SET product_name = $1, 
           product_code = $2, 
           product_category = $3,
           unit = $4, 
           critical_stock_level = $5, 
           brand = $6,
           hsn_code = $7,
           description = $8,
           gst_percent = $9,
           sales_price = $10,
           opening_stock = $11,
           opening_stock_value = $12,
           current_stock = $13,
           low_stock_alert_qty = $14,
           reorder_qty = $15,
           location = $16,
           rack_number = $17,
           product_image = $18,
           supplier_name = $19,
           supplier_code = $20,
           product_status = $21,
           tax_preference = $22,
           exemption_reason = $23,
           intra_state_tax_rate = $24,
           updated_at = NOW()
       WHERE id = $25
       RETURNING *`,
      [
        product_name,
        product_code,
        product_category,
        unit,
        critical_stock_level,
        brand,
        hsn_code,
        description,
        gst_percent,
        sales_price,
        opening_stock,
        opening_stock_value,
        current_stock,
        low_stock_alert_qty,
        reorder_qty,
        location,
        rack_number,
        product_image,
        supplier_name,
        supplier_code,
        product_status,
        tax_preference,
        exemption_reason,
        intra_state_tax_rate,
        params.id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
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

    const id = params.id;

    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}