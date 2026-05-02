import crypto from 'crypto';
import { env } from '../config/env';

// ─── eSewa Payment Integration ───
// Uses eSewa's epay API for payment processing
// Docs: https://developer.esewa.com.np/

const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://epay.esewa.com.np'
    : 'https://rc-epay.esewa.com.np',
  verifyUrl: process.env.NODE_ENV === 'production'
    ? 'https://epay.esewa.com.np/api/epay/transaction/status/'
    : 'https://uat.esewa.com.np/api/epay/transaction/status/',
};

export interface EsewaPaymentInit {
  orderId: string;
  totalAmount: number;
  taxAmount: number;
  productDeliveryCharge: number;
  productServiceCharge: number;
}

export interface EsewaPaymentPayload {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

function generateSignature(message: string): string {
  return crypto
    .createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(message)
    .digest('base64');
}

export function initializeEsewaPayment(input: EsewaPaymentInit): {
  paymentUrl: string;
  payload: EsewaPaymentPayload;
} {
  const clientUrl = env.CLIENT_URL;
  const { orderId, totalAmount, taxAmount, productDeliveryCharge, productServiceCharge } = input;

  const amount = (totalAmount - taxAmount - productDeliveryCharge - productServiceCharge).toString();
  const transactionUuid = orderId;

  const signedFieldNames = 'total_amount,transaction_uuid,product_code';
  const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_CONFIG.merchantId}`;
  const signature = generateSignature(signatureMessage);

  const payload: EsewaPaymentPayload = {
    amount,
    tax_amount: taxAmount.toString(),
    total_amount: totalAmount.toString(),
    transaction_uuid: transactionUuid,
    product_code: ESEWA_CONFIG.merchantId,
    product_service_charge: productServiceCharge.toString(),
    product_delivery_charge: productDeliveryCharge.toString(),
    success_url: `${clientUrl}/orders/payment/esewa/success`,
    failure_url: `${clientUrl}/orders/payment/esewa/failure`,
    signed_field_names: signedFieldNames,
    signature,
  };

  return {
    paymentUrl: `${ESEWA_CONFIG.baseUrl}/api/epay/main/v2/form`,
    payload,
  };
}

export async function verifyEsewaPayment(encodedData: string): Promise<{
  success: boolean;
  transactionCode?: string;
  orderId?: string;
  totalAmount?: number;
  status?: string;
}> {
  try {
    const decodedData = JSON.parse(
      Buffer.from(encodedData, 'base64').toString('utf-8')
    );

    const { transaction_uuid, total_amount, status, transaction_code } = decodedData;

    // Verify signature
    const signedFieldNames = 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names';
    const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_CONFIG.merchantId},signed_field_names=${signedFieldNames}`;
    const expectedSignature = generateSignature(message);

    if (decodedData.signature !== expectedSignature) {
      console.warn('[eSewa] Signature mismatch — possible tampering');
    }

    if (status !== 'COMPLETE') {
      return { success: false, status };
    }

    return {
      success: true,
      transactionCode: transaction_code,
      orderId: transaction_uuid,
      totalAmount: parseFloat(total_amount),
      status,
    };
  } catch {
    return { success: false };
  }
}

export function isEsewaConfigured(): boolean {
  return !!ESEWA_CONFIG.merchantId;
}
