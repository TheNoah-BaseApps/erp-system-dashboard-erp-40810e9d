/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
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
 *         description: Customer retrieved successfully
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Customer not found
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
 *         description: Failed to delete customer
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
      'SELECT * FROM customers WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      console.error('PUT customer authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // Validate customer ID
    if (!params.id) {
      console.error('PUT customer error: Missing customer ID');
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('PUT customer error: Invalid JSON body', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      customer_name,
      customer_code,
      address,
      city_or_district,
      sales_rep,
      country,
      region_or_state,
      telephone_number,
      email,
      contact_person,
      payment_terms_limit,
      balance_risk_limit,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_code) {
      console.error('PUT customer error: Missing required fields', { customer_name, customer_code });
      return NextResponse.json(
        { success: false, error: 'Customer name and customer code are required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      console.error('PUT customer error: Invalid email format', { email });
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate numeric fields if provided
    if (payment_terms_limit !== undefined && payment_terms_limit !== null && isNaN(payment_terms_limit)) {
      console.error('PUT customer error: Invalid payment_terms_limit', { payment_terms_limit });
      return NextResponse.json(
        { success: false, error: 'Payment terms limit must be a valid number' },
        { status: 400 }
      );
    }

    if (balance_risk_limit !== undefined && balance_risk_limit !== null && isNaN(balance_risk_limit)) {
      console.error('PUT customer error: Invalid balance_risk_limit', { balance_risk_limit });
      return NextResponse.json(
        { success: false, error: 'Balance risk limit must be a valid number' },
        { status: 400 }
      );
    }

    // Update customer with proper parameter binding
    const result = await query(
      `UPDATE customers 
       SET customer_name = $1, 
           customer_code = $2, 
           address = $3,
           city_or_district = $4, 
           sales_rep = $5, 
           country = $6,
           region_or_state = $7, 
           telephone_number = $8, 
           email = $9,
           contact_person = $10, 
           payment_terms_limit = $11,
           balance_risk_limit = $12, 
           updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        customer_name,
        customer_code,
        address || null,
        city_or_district || null,
        sales_rep || null,
        country || null,
        region_or_state || null,
        telephone_number || null,
        email || null,
        contact_person || null,
        payment_terms_limit || null,
        balance_risk_limit || null,
        params.id,
      ]
    );

    if (!result.rows || result.rows.length === 0) {
      console.error('PUT customer error: Customer not found', { id: params.id });
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Customer updated successfully',
    });
  } catch (error) {
    console.error('Update customer error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      customerId: params?.id,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to update customer. Please check the data and try again.' },
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
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}