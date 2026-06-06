import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message: string): Promise<{ ok: boolean; error?: string }> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
          const error = 'TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID 환경변수가 설정되지 않았습니다.';
          console.error('[Telegram]', error);
          return { ok: false, error };
    }

  try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                          chat_id: TELEGRAM_CHAT_ID,
                          text: message,
                          parse_mode: 'HTML',
                }),
        });
        const data = await res.json();
        if (!data.ok) {
                console.error('[Telegram] API error:', data);
                return { ok: false, error: data.description || 'Telegram API 오류' };
        }
        return { ok: true };
  } catch (err) {
        const error = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('[Telegram] Fetch error:', error);
        return { ok: false, error };
  }
}

export async function POST(req: NextRequest) {
    try {
          const body = await req.json();
          const { type, data } = body;

      let message = '';

      if (type === 'test') {
              message = '✅ 텔레그램 연동 테스트 성공';
      } else if (type === 'inquiry') {
              message = `📢 <b>새 광고 문의가 들어왔습니다.</b>\n\n브랜드: ${data.brand || '-'}\n담당자: ${data.name || '-'}\n연락처: ${data.phone || data.email || '-'}\n선호 채널: ${data.preferred_channel || '-'}\n접수 시간: ${data.created_at || new Date().toLocaleString('ko-KR')}`;
      } else if (type === 'approval') {
              message = `✅ <b>새 승인 요청이 들어왔습니다.</b>\n\n브랜드: ${data.brand || '-'}\n채널: ${data.channel || '-'}\n요청자: ${data.requester || '-'}\n요청 시간: ${data.created_at || new Date().toLocaleString('ko-KR')}`;
      } else {
              return NextResponse.json({ ok: false, error: '알 수 없는 알림 타입' }, { status: 400 });
      }

      const result = await sendTelegramMessage(message);

      if (!result.ok) {
              return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    } catch (err) {
          const error = err instanceof Error ? err.message : '알 수 없는 오류';
          console.error('[Telegram Route] Error:', error);
          return NextResponse.json({ ok: false, error }, { status: 500 });
    }
}
