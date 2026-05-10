import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { buildTherapistContext } from '@/lib/therapists';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Si AI poradca pre duševné zdravie v aplikácii Teraplan. Tvoja úloha je:
1. Vypočuť si klienta a porozumieť jeho situácii
2. Na základe toho odporučiť konkrétneho terapeuta z databázy partnerov

PRAVIDLÁ:
- Odpovedaj VŽDY po slovensky
- Buď vrúcny, empatický a nestranný — počúvaj, nepouč
- NEKLADIE klinické diagnózy, iba odporúčaj terapeutov
- Ak hovorí o samovražde alebo sebapoškodzovaní, odkaž na Linku dôvery Nezábudka: 0800 800 566 (24/7, zadarmo)
- Po 1–2 otázkach (keď rozumieš problému) odporuč 1–2 konkrétnych terapeutov zo zoznamu nižšie
- Pri odporúčaní uveď: meno, cenu, témy a URL profilu vo formáte:
  **[Meno terapeuta]** — [cena] — [témy] — [URL]
- Ak klient nechce konkrétneho terapeuta ale iba platformu, odporuč platformu
- Buď stručný — max 4–5 viet na odpoveď

${buildTherapistContext()}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Chýbajú správy.' }, { status: 400 });
  }

  const apiMessages = messages
    .filter((m: any) => m.role === 'user' || m.role === 'assistant')
    .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(enc.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  });
}
