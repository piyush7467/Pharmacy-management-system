export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PharmaPulse (PharmaFlow) Pharmacy Management API',
    version: '1.0.0',
    description:
      'Production-grade RESTful API built for ALGIONS AI LABS PRIVATE LIMITED assessment. Features FEFO batch inventory allocation, double-entry mathematical ledger reconciliation, Argon2id authentication, and itemized POS tax billing.',
    contact: {
      name: 'ALGIONS AI LABS Evaluation Team',
      email: 'assessment@algions.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your signed JWT access token in the Authorization header: `Bearer <token>`'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string', example: 'req-12345' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request payload' }
            }
          },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string', example: 'req-12345' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  },
  tags: [
    { name: 'System', description: 'API Healthcheck and operational monitoring' },
    { name: 'Authentication', description: 'Argon2id session credentials & JWT cookie rotation' },
    { name: 'Staff Management', description: 'User roles, permissions, and status controls' },
    { name: 'Medicines Catalogue', description: 'Pharmaceutical formulations, strengths, and SKU barcodes' },
    { name: 'Categories', description: 'Therapeutic and regulatory classifications' },
    { name: 'Suppliers', description: 'Pharmaceutical distributors, ledgers, and contact directory' },
    { name: 'Purchases & GRN', description: 'Procurement orders, Goods Received Notes, and lot creation' },
    { name: 'Point of Sale (POS)', description: 'FEFO greedy batch checkout, tax/discounting, and invoices' },
    { name: 'Customer Returns', description: 'Auditable credit notes and stock restitution with reason tracking' },
    { name: 'Inventory & Batches', description: 'Granular lot balances, expiry countdowns, and write-offs' },
    { name: 'Reports & Analytics', description: 'Mathematical ledger reconciliation, margins, and sales metrics' },
    { name: 'Audit Trail', description: 'Immutable administrative action history and state diffs' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Server Health & Diagnostics',
        description: 'Returns operational uptime, memory status, and database pool state.',
        responses: {
          '200': {
            description: 'Backend service is online and healthy.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate with Email & Password',
        description: 'Verifies password using Argon2id, issues a 15-minute JWT, and sets an HttpOnly refresh cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@pharmapulse.demo' },
                  password: { type: 'string', format: 'password', example: 'AdminSecurePassword123!' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Authentication successful. Returns user profile and access token.' },
          '401': { description: 'Invalid email or password.' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated Profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Active user session profile.' },
          '401': { description: 'Authentication required.' }
        }
      }
    },
    '/auth/profile': {
      patch: {
        tags: ['Authentication'],
        summary: 'Update Staff Account Details',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName'],
                properties: {
                  fullName: { type: 'string', example: 'Piyush Shakya' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Profile updated successfully.' },
          '400': { description: 'Validation failed.' },
          '401': { description: 'Authentication required.' }
        }
      }
    },
    '/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Change Personal Account Password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', format: 'password' },
                  newPassword: { type: 'string', format: 'password', minLength: 8 }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Password changed successfully.' },
          '400': { description: 'Current password incorrect or validation failed.' },
          '401': { description: 'Authentication required.' }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate Refresh Token',
        description: 'Presents HttpOnly cookie to issue a new access token and rotate the refresh token family.',
        responses: {
          '200': { description: 'Token refreshed successfully.' },
          '401': { description: 'Refresh token invalid or family revoked.' }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke Session and Clear Cookie',
        responses: {
          '200': { description: 'Logged out successfully.' }
        }
      }
    },
    '/medicines': {
      get: {
        tags: ['Medicines Catalogue'],
        summary: 'List Master Medicines Index',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, salt, SKU' },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'lowStockOnly', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          '200': { description: 'Array of medicines with live computed stock levels.' }
        }
      },
      post: {
        tags: ['Medicines Catalogue'],
        summary: 'Register New Formulation',
        security: [{ bearerAuth: [] }],
        description: 'Requires ADMIN or PHARMACIST role.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['categoryId', 'name', 'sku', 'dosageForm'],
                properties: {
                  categoryId: { type: 'string', format: 'uuid' },
                  name: { type: 'string', example: 'Amoxicillin Trihydrate' },
                  genericName: { type: 'string', example: 'Amoxicillin' },
                  sku: { type: 'string', example: 'AMX-250-CAP' },
                  dosageForm: { type: 'string', example: 'Capsule' },
                  strength: { type: 'string', example: '250mg' },
                  packageUnit: { type: 'string', example: 'Strip of 10' },
                  minReorderLevel: { type: 'integer', example: 20 }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Medicine registered successfully.' },
          '409': { description: 'SKU barcode already exists.' }
        }
      }
    },
    '/sales': {
      get: {
        tags: ['Point of Sale (POS)'],
        summary: 'List Fiscal Sales Invoices',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'paymentMethod', in: 'query', schema: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'SPLIT'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['COMPLETED', 'REFUNDED_PARTIAL', 'REFUNDED_FULL'] } }
        ],
        responses: {
          '200': { description: 'List of sales transactions.' }
        }
      },
      post: {
        tags: ['Point of Sale (POS)'],
        summary: 'Execute Transactional POS Checkout',
        security: [{ bearerAuth: [] }],
        description:
          'Executes greedy FEFO batch deduction, checks idempotency key, records immutable StockMovements, and creates fiscal tax invoice.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items', 'paymentMethod'],
                properties: {
                  idempotencyKey: { type: 'string', example: 'TMP-415015' },
                  customerName: { type: 'string', example: 'Walk-in Customer' },
                  customerPhone: { type: 'string', example: '+91 9876543210' },
                  paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'SPLIT'], example: 'CASH' },
                  discountAmount: { type: 'number', example: 0 },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['medicineId', 'quantity'],
                      properties: {
                        medicineId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer', example: 2 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Sale completed and batches deducted via FEFO.' },
          '400': { description: 'Insufficient stock or expired batch rejected.' }
        }
      }
    },
    '/sales/preview-fefo': {
      get: {
        tags: ['Point of Sale (POS)'],
        summary: 'Preview FEFO Allocation Without Mutating State',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'medicineId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'quantity', in: 'query', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Shows exact batches that will be deducted during checkout.' }
        }
      }
    },
    '/returns': {
      get: {
        tags: ['Customer Returns'],
        summary: 'List Customer Return Credit Notes',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of auditable return notes.' }
        }
      },
      post: {
        tags: ['Customer Returns'],
        summary: 'Process Return Note & Restock Batches',
        security: [{ bearerAuth: [] }],
        description: 'Restricted to ADMIN and PHARMACIST. Enforces proportional refund caps and mandatory audit reason.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['saleId', 'reason', 'items'],
                properties: {
                  saleId: { type: 'string', format: 'uuid' },
                  reason: { type: 'string', example: 'Doctor changed prescription; package intact' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['saleItemId', 'quantity', 'disposition'],
                      properties: {
                        saleItemId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer', example: 1 },
                        disposition: { type: 'string', enum: ['RESTOCKED', 'DAMAGED_DISCARDED'] }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Return processed and inventory restituted.' }
        }
      }
    },
    '/inventory/batches': {
      get: {
        tags: ['Inventory & Batches'],
        summary: 'List Batch-Wise Pharmaceutical Lots',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'DEPLETED', 'QUARANTINED', 'EXPIRED'] } },
          { name: 'expiringWithinDays', in: 'query', schema: { type: 'integer', enum: [30, 60, 90] } }
        ],
        responses: {
          '200': { description: 'Batches list with live days-to-expiry calculations.' }
        }
      }
    },
    '/inventory/adjustments': {
      post: {
        tags: ['Inventory & Batches'],
        summary: 'Record Auditable Stock Adjustment / Write-Off',
        security: [{ bearerAuth: [] }],
        description: 'Restricted to ADMIN and PHARMACIST. Enforces non-negative stock balance and mandatory reason.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['batchId', 'adjustmentType', 'quantityDelta', 'reason'],
                properties: {
                  batchId: { type: 'string', format: 'uuid' },
                  adjustmentType: {
                    type: 'string',
                    enum: ['WRITE_OFF_DAMAGED', 'WRITE_OFF_EXPIRED', 'AUDIT_DISCREPANCY', 'AUDIT_SURPLUS']
                  },
                  quantityDelta: { type: 'integer', example: -2 },
                  reason: { type: 'string', example: 'Damaged during shelf reorganization' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Adjustment recorded in immutable ledger.' }
        }
      }
    },
    '/reports/reconciliation': {
      get: {
        tags: ['Reports & Analytics'],
        summary: 'Mathematical Stock Ledger Reconciliation',
        security: [{ bearerAuth: [] }],
        description:
          'Verifies the fundamental double-entry equation: CurrentStock = InwardReceipts - Sales + Returns - Adjustments. Returns Delta verification.',
        responses: {
          '200': { description: 'Mathematical balance verification report.' }
        }
      }
    },
    '/reports/sales-summary': {
      get: {
        tags: ['Reports & Analytics'],
        summary: 'Sales Trends & Tender Distribution',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } }
        ],
        responses: {
          '200': { description: 'Daily sales trend and payment method distribution.' }
        }
      }
    },
    '/audit-logs': {
      get: {
        tags: ['Audit Trail'],
        summary: 'List Immutable Administrative Audit Logs',
        security: [{ bearerAuth: [] }],
        description: 'Restricted to ADMIN role only. Documents operational mutations with IP and state diffs.',
        responses: {
          '200': { description: 'Audit trail records.' },
          '403': { description: 'Denied. Access restricted to Administrator.' }
        }
      }
    }
  }
};
