'use strict';

const http = require('node:http');

const PORT = Number(process.env.MOCK_API_PORT || 5100);
const WEB_ORIGIN = 'http://127.0.0.1:3100';
const PRODUCT_ID = 'phase1-product';
const VARIANT_ID = 'phase1-variant-premium';

const productCard = {
  _id: PRODUCT_ID,
  name: { en: 'Phase One Retractable Awning' },
  slug: 'phase-one-retractable-awning',
  shortDescription: { en: 'A test-configurable retractable shade.' },
  showPrice: true,
  priceFrom: 10,
  isFeatured: true,
  images: [],
};

const productDetail = {
  product: {
    _id: PRODUCT_ID,
    name: productCard.name,
    slug: productCard.slug,
    shortDescription: productCard.shortDescription,
    description: { en: 'A test-configurable retractable shade.' },
    features: [],
    images: [],
    showPrice: true,
    category: { name: { en: 'Awnings' }, slug: 'awnings' },
    productType: { name: { en: 'Retractable Awning' }, slug: 'retractable-awning', code: 'AWN' },
  },
  variants: [
    {
      _id: 'phase1-variant-standard',
      name: { en: 'Standard 2m × 2m' },
      sku: 'E2E-STANDARD',
      displayPrice: 10,
      priceType: 'retail',
      availability: 'in_stock',
      isDefault: true,
      widthMin: 2,
      widthMax: 2,
      projectionMin: 2,
      projectionMax: 2,
    },
    {
      _id: VARIANT_ID,
      name: { en: 'Premium 3m × 2m' },
      sku: 'E2E-PREMIUM',
      displayPrice: 15,
      priceType: 'retail',
      availability: 'made_to_order',
      leadTimeDays: 21,
      widthMin: 3,
      widthMax: 3,
      projectionMin: 2,
      projectionMax: 2,
    },
  ],
  moduleVisibility: {},
  content: null,
  faqs: [],
  manuals: [],
  relatedProducts: [],
  reviews: { summary: { count: 0, averageRating: null }, recent: [] },
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: productCard.name.en, url: null },
  ],
  jsonLd: { product: {}, breadcrumb: {} },
};

const testLead = {
  _id: 'phase1-lead',
  name: 'Test Customer',
  email: 'private.customer@example.test',
  phone: '555-0101',
  subject: 'Installation request',
  issueType: 'installation',
  productType: 'Awning',
  region: 'Miami, FL',
  message: 'Please arrange installation for my new awning.',
};

const state = {};

function createCartItem(variantId = VARIANT_ID) {
  const variant = productDetail.variants.find((entry) => entry._id === variantId) || productDetail.variants[0];
  const price = variant.displayPrice;
  return {
    _id: 'phase1-cart-item',
    product: {
      _id: PRODUCT_ID,
      name: productCard.name,
      slug: productCard.slug,
    },
    variant: {
      _id: variant._id,
      name: variant.name,
      sku: variant.sku,
      availability: variant.availability,
      leadTimeDays: variant.leadTimeDays,
    },
    quantity: 1,
    selectedOptions: {},
    pricing: {
      displayPrice: price,
      priceType: 'retail',
      surcharges: [],
      totalSurcharge: 0,
      unitPrice: price,
      lineTotal: price,
    },
    priceChanged: false,
    isAvailable: true,
  };
}

function matrixCartItem(label, price, surcharge) {
  return {
    ...createCartItem(),
    _id: `matrix-${label}`,
    product: { _id: PRODUCT_ID, name: { en: label }, slug: productCard.slug },
    pricing: {
      displayPrice: 10,
      priceType: 'retail',
      surcharges: surcharge ? [{ label: 'Option surcharge', type: label, amount: surcharge }] : [],
      totalSurcharge: surcharge,
      unitPrice: price,
      lineTotal: price,
    },
  };
}

function reset(fixture = '') {
  state.simulateLeadServiceOutage = fixture === 'lead-service-outage';
  state.cartItems = fixture === 'pricing-matrix'
    ? [
      matrixCartItem('No surcharge', 10, 0),
      matrixCartItem('Fixed surcharge', 10.5, 0.5),
      matrixCartItem('Percent surcharge', 12, 2),
      matrixCartItem('Per-unit surcharge', 16, 6),
    ]
    : [];
  state.quote = null;
  state.compareRequests = [];
  state.installerLead = {
    _id: 'phase1-assignment',
    status: 'offered',
    offeredAt: '2026-01-01T00:00:00.000Z',
    lead: {
      subject: testLead.subject,
      issueType: testLead.issueType,
      productType: testLead.productType,
      region: testLead.region,
      message: 'Installation is needed in the listed service area.',
    },
  };
  state.leads = [];
}

function getCart() {
  const subtotal = state.cartItems.reduce((sum, item) => sum + item.pricing.lineTotal * item.quantity, 0);
  return {
    _id: 'phase1-cart',
    items: state.cartItems,
    totals: { subtotal, orderDiscount: 0, appliedPromos: [], orderSubtotal: subtotal },
    couponCodes: [],
    itemCount: state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function send(res, status, value) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': WEB_ORIGIN,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Idempotency-Key',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}

function quoteDetail() {
  return {
    _id: state.quote?._id || 'phase1-quote-id',
    referenceNumber: state.quote?.referenceNumber || 'QT-E2E-0001',
    status: state.quote?.status || 'submitted',
    enquiryQueue: 'consumer',
    guestContact: { firstName: 'Avery', lastName: 'Tester', email: 'avery@example.test', phone: '', company: '' },
    items: [{ productName: productCard.name.en, variantName: 'Premium 3m × 2m', sku: 'E2E-PREMIUM', quantity: 1, selectedOptions: {}, unitPrice: state.quote?.subtotal ?? null, totalPrice: state.quote?.subtotal ?? null }],
    attachments: state.quote?.attachments || [],
    projectDescription: 'A test project requiring a written quote.',
    installationAddress: { line1: '123 Test Street', city: 'Miami', state: 'FL', zip: '33101', country: 'US' },
    subtotal: state.quote?.subtotal ?? null,
    tax: state.quote?.tax ?? null,
    total: state.quote?.total ?? null,
    currency: 'USD',
    priceLocked: state.quote?.status === 'ordered',
    orderId: state.quote?.orderId || undefined,
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': WEB_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Idempotency-Key',
    });
    return res.end();
  }
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { status: 'ok' });
  if (req.method === 'POST' && url.pathname === '/__test/reset') {
    reset(url.searchParams.get('fixture') || '');
    return send(res, 200, { success: true });
  }
  if (req.method === 'GET' && url.pathname === '/__test/leads') {
    return send(res, 200, { success: true, data: state.leads });
  }
  if (req.method === 'GET' && url.pathname === '/api/homepage') return send(res, 200, { success: true, data: [] });
  if (req.method === 'GET' && url.pathname === '/api/categories') return send(res, 200, { success: true, data: [] });
  if (req.method === 'GET' && url.pathname === '/api/products') {
    return send(res, 200, { success: true, data: [productCard], pagination: { page: 1, limit: 24, total: 1, pages: 1 } });
  }
  if (req.method === 'GET' && url.pathname === '/api/categories/awnings') {
    return send(res, 200, {
      success: true,
      data: {
        category: { _id: 'phase1-category', name: { en: 'Awnings' }, slug: 'awnings', sortOrder: 1 },
        content: null,
        products: [productCard],
        facets: [],
        activeFilters: {},
        sort: 'sortOrder',
        seo: { canonical: '/category/awnings', noindex: false },
        pagination: { page: 1, limit: 24, total: 1, pages: 1 },
      },
    });
  }
  if (req.method === 'GET' && url.pathname === `/api/products/${productCard.slug}`) {
    return send(res, 200, { success: true, data: productDetail });
  }
  if (req.method === 'GET' && url.pathname === '/api/compare') {
    const ids = (url.searchParams.get('ids') || '').split(',').filter(Boolean);
    state.compareRequests.push(ids);
    return send(res, 200, {
      success: true,
      data: {
        items: [{
          variantId: VARIANT_ID,
          variantName: { en: 'Premium 3m × 2m' },
          sku: 'E2E-PREMIUM',
          availability: 'made_to_order',
          leadTimeDays: 21,
          displayPrice: 15,
          priceType: 'retail',
          product: { _id: PRODUCT_ID, name: productCard.name, slug: productCard.slug },
        }],
        rows: [{
          key: 'width_range',
          label: { en: 'Width' },
          unit: 'm',
          values: ['3–3"'],
          hasDifference: false,
        }],
        isCrossCategory: false,
      },
    });
  }
  if (req.method === 'GET' && url.pathname === '/__test/compare-requests') {
    return send(res, 200, { success: true, data: state.compareRequests });
  }
  if (req.method === 'GET' && url.pathname === '/api/nav/main') {
    return send(res, 200, { success: true, data: { type: 'main', items: [] } });
  }
  if (req.method === 'GET' && url.pathname === '/api/footer') {
    return send(res, 200, {
      success: true,
      data: {
        linkGroups: [],
        phone: '',
        email: '',
        socialLinks: [],
        legalLinks: [],
      },
    });
  }
  if (req.method === 'POST' && url.pathname === '/api/cart/items') {
    const body = await readBody(req);
    state.cartItems = [createCartItem(body.variantId)];
    return send(res, 201, { success: true, message: 'Added to cart', data: { itemCount: 1 } });
  }
  if (req.method === 'GET' && url.pathname === '/api/cart') return send(res, 200, { success: true, data: getCart() });
  if (req.method === 'GET' && url.pathname === '/api/shipping/estimate') {
    return send(res, 200, { success: true, data: { available: true, productionDays: 21, transitDays: 4, totalDays: 25 } });
  }
  if (req.method === 'POST' && url.pathname === '/api/cart/checkout') {
    return send(res, 200, { success: true, data: { items: state.cartItems, totals: getCart().totals, couponCodes: [], hasPriceChanges: false } });
  }
  if (req.method === 'POST' && url.pathname === '/api/cart/checkout-options') {
    const subtotal = getCart().totals.orderSubtotal;
    return send(res, 200, {
      success: true,
      data: {
        checkoutToken: 'phase1-checkout-token',
        quoteRequired: false,
        subtotal,
        shipping: { label: 'Ground shipping', carrierName: 'Test carrier', cost: 0, charges: [], productionDays: 21, transitDays: 4, estimatedDeliveryDate: '2026-11-01T00:00:00.000Z' },
        tax: 0,
        total: subtotal,
        currency: 'USD',
        expiresAt: '2026-12-01T00:00:00.000Z',
      },
    });
  }
  if (req.method === 'POST' && url.pathname === '/api/cart/place-order') {
    return send(res, 201, {
      success: true,
      data: {
        orderId: 'phase1-order-id',
        orderNumber: 'SH-E2E-0001',
        total: getCart().totals.orderSubtotal,
        priceChanges: [],
        checkoutUrl: `${WEB_ORIGIN}/checkout/complete?session_id=phase1-payment-session`,
      },
    });
  }
  if (req.method === 'GET' && url.pathname === '/api/payments/session/phase1-payment-session') {
    return send(res, 200, { success: true, data: { paid: true, orderNumber: 'SH-E2E-0001', total: getCart().totals.orderSubtotal, currency: 'USD', paymentStatus: 'paid' } });
  }
  if (req.method === 'POST' && url.pathname === '/api/quotes/upload-url') {
    return send(res, 200, { success: true, key: 'test/quote-attachment.pdf', uploadUrl: `http://127.0.0.1:${PORT}/mock-s3/upload`, fields: { key: 'test/quote-attachment.pdf', policy: 'test-policy' } });
  }
  if (req.method === 'POST' && url.pathname === '/mock-s3/upload') {
    req.resume();
    req.on('end', () => {
      res.writeHead(204, { 'Access-Control-Allow-Origin': WEB_ORIGIN });
      res.end();
    });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/quotes') {
    const body = await readBody(req);
    state.quote = {
      _id: 'phase1-quote-id',
      referenceNumber: 'QT-E2E-0001',
      status: 'submitted',
      attachments: (body.attachments || []).map((file, index) => ({
        _id: `attachment-${index}`,
        filename: file.filename,
        contentType: 'application/pdf',
        sizeBytes: 1024,
      })),
    };
    return send(res, 201, { success: true, referenceNumber: state.quote.referenceNumber, guestToken: 'test-guest-token' });
  }
  if (req.method === 'GET' && url.pathname === '/admin/quotes') {
    const detail = quoteDetail();
    return send(res, 200, { success: true, data: state.quote ? [detail] : [], pagination: { pages: 1, total: state.quote ? 1 : 0 } });
  }
  if (req.method === 'GET' && url.pathname === '/admin/quotes/staff') return send(res, 200, { success: true, data: [] });
  if (req.method === 'GET' && url.pathname === '/admin/quotes/phase1-quote-id') {
    return send(res, 200, { success: true, data: quoteDetail() });
  }
  if (req.method === 'PATCH' && url.pathname === '/admin/quotes/phase1-quote-id') {
    const body = await readBody(req);
    Object.assign(state.quote, body);
    return send(res, 200, { success: true, data: quoteDetail(), message: 'Quote updated.' });
  }
  if (req.method === 'POST' && url.pathname === '/admin/quotes/phase1-quote-id/convert-to-order') {
    state.quote.status = 'ordered';
    state.quote.orderId = 'phase1-order-id';
    return send(res, 200, { success: true, data: { order: { orderNumber: 'SH-QUOTE-E2E-0001' } } });
  }
  if (req.method === 'GET' && url.pathname === '/api/installers/portal/profile') {
    return send(res, 200, { success: true, data: { businessName: 'Test Installer', coverageAreas: [], certifiedProductTypes: [], responseRatePercent: 100, jobsCompleted: 1 } });
  }
  if (req.method === 'GET' && url.pathname === '/api/installers/portal/leads') {
    return send(res, 200, { success: true, data: [state.installerLead] });
  }
  if (req.method === 'PATCH' && url.pathname === '/api/installers/portal/leads/phase1-assignment/respond/accept') {
    state.installerLead = {
      ...state.installerLead,
      status: 'accepted',
      lead: { ...state.installerLead.lead, name: testLead.name, email: testLead.email, phone: testLead.phone },
    };
    return send(res, 200, { success: true, message: 'Lead accepted. Customer contact details are now available.', data: state.installerLead });
  }
  if (req.method === 'POST' && ['/api/content/leads', '/api/content/contact'].includes(url.pathname)) {
    const body = await readBody(req);
    const lead = {
      _id: `lead-${state.leads.length + 1}`,
      crmSyncStatus: 'pending',
      notificationStatus: state.simulateLeadServiceOutage ? 'failed' : 'queued',
      ...body,
    };
    state.leads.push(lead);
    return send(res, 201, { success: true, message: 'Thank you. Your message has been received.', data: { reference: lead._id } });
  }
  if (req.method === 'POST' && url.pathname === '/api/privacy/consent') return send(res, 201, { success: true, data: { id: 'phase1-consent' } });

  return send(res, 404, { success: false, message: `Unmocked test API route: ${req.method} ${url.pathname}` });
});

reset();
server.listen(PORT, '127.0.0.1');
