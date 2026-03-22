import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData, ChatMessage } from "../types";
import { EXTRACTION_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from "../constants";
import * as XLSX from 'xlsx';

import { normalizeDate } from "../utils/dateUtils";

export async function extractInvoiceData(base64Data: string, mimeType: string): Promise<InvoiceData> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the Secrets panel.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    let contentPart: any;
    const isSpreadsheet = mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv');

    if (isSpreadsheet) {
      // Parse spreadsheet to text
      const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const binaryString = atob(base64);
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      let spreadsheetText = "";
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        spreadsheetText += `\nSheet: ${sheetName}\n`;
        spreadsheetText += XLSX.utils.sheet_to_csv(worksheet);
      });

      contentPart = { text: `SPREADSHEET CONTENT:\n${spreadsheetText}\n\n${EXTRACTION_SYSTEM_PROMPT}` };
    } else {
      contentPart = {
        inlineData: {
          data: base64Data.includes(',') ? base64Data.split(',')[1] : base64Data,
          mimeType: mimeType
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          parts: [
            !isSpreadsheet ? { text: EXTRACTION_SYSTEM_PROMPT + "\n\nCRITICAL: Extract ALL line items. If there are many, do not skip any. Ensure subtotal + tax = total. If they don't match on the invoice, extract the values as written but note the discrepancy in your internal reasoning." } : null,
            contentPart
          ].filter(Boolean) as any
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendorName: { type: Type.STRING },
            invoiceNumber: { type: Type.STRING },
            invoiceDate: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            lineItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  amount: { type: Type.NUMBER }
                },
                required: ["description", "amount"]
              }
            },
            subtotal: { type: Type.NUMBER },
            taxAmount: { type: Type.NUMBER },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            paymentTerms: { type: Type.STRING },
            vendorAddress: { type: Type.STRING },
            confidence: {
              type: Type.OBJECT,
              properties: {
                vendorName: { type: Type.NUMBER },
                invoiceNumber: { type: Type.NUMBER },
                totalAmount: { type: Type.NUMBER }
              },
              required: ["vendorName", "totalAmount"]
            }
          },
          required: ["vendorName", "totalAmount", "currency", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("The AI model returned an empty response.");
    
    const data = JSON.parse(text) as InvoiceData;
    
    // Normalize dates
    data.invoiceDate = normalizeDate(data.invoiceDate);
    data.dueDate = normalizeDate(data.dueDate);
    
    return data;
  } catch (error) {
    console.error("Extraction Error:", error);
    throw error;
  }
}

export async function chatWithAssistant(
  message: string, 
  history: ChatMessage[], 
  invoiceData?: InvoiceData
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });

  // Convert history to Gemini format (role: 'user' | 'model')
  const geminiHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: CHAT_SYSTEM_PROMPT + (invoiceData ? `\n\nCONTEXTUAL DATA (JSON):\n${JSON.stringify(invoiceData, null, 2)}\n\nUse this JSON to answer questions. If the user asks for a calculation (e.g., "What's the average unit price?"), perform it based on this data.` : ""),
    },
    history: geminiHistory
  });

  const response = await chat.sendMessage({
    message: message
  });

  return response.text || "I'm sorry, I couldn't process that request.";
}
