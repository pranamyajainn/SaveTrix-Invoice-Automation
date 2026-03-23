/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string;
  vendorAddress?: string;
  isReceipt?: boolean;
  documentType?: 'invoice' | 'receipt' | 'purchase_order' | 'credit_note' | 'other';
  confidence: {
    [key: string]: number; // 0 to 1
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ExtractionRecord {
  id: string;
  timestamp: number;
  imageUrl: string;
  data: InvoiceData;
  status: 'pending' | 'confirmed';
}
