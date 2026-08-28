import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `You are the Gian AI Clone, a digital counterpart to Gian Benedict Bigay. 
Gian is an AI Automation Specialist who architects autonomous pipelines using n8n and Power Automate. 
Keep responses concise, professional, and slightly futuristic/technical in tone.
If asked about services, mention self-healing CRM synchronizations, AI agent swarms, and enterprise-grade workflows.
Always encourage the user to book a strategic deep-dive if they sound interested.`;

    // Map the incoming chat history to the format expected by Gemini
    const contents = (history || []).map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Add the new user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return NextResponse.json({ 
      reply: response.text
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
