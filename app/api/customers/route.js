/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Customer created successfully
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
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
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
    if (!customer_name || !customer_code || !email) {
      return NextResponse.json(
        { success: false, error: 'Customer name, code, and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for duplicate customer code
    const existing = await query(
      'SELECT id FROM customers WHERE customer_code = $1',
      [customer_code]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Customer code already exists' },
        { status: 400 }
      );
    }

    // Create customer
    const result = await query(
      `INSERT INTO customers (
        customer_name, customer_code, address, city_or_district, sales_rep,
        country, region_or_state, telephone_number, email, contact_person,
        payment_terms_limit, balance_risk_limit, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
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
        payment_terms_limit || 0,
        balance_risk_limit || 0,
        authResult.user.userId,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}