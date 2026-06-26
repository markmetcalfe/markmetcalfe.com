import { GameRoom } from './game-room'

export { GameRoom }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

function generateRoomId(): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(36).padStart(2, '0')).join('').slice(0, 6)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (pathname === '/api/doodle/rooms') {
      if (request.method === 'POST') {
        return json({ roomId: generateRoomId() })
      }
      if (request.method === 'GET') {
        if (!env.ROOM_LIST) return json([])
        const list = await env.ROOM_LIST.list({ prefix: 'room:' })
        const rooms = await Promise.all(
          list.keys.map(async (k) => {
            const val = await env.ROOM_LIST!.get(k.name, 'json') as Record<string, unknown> | null
            return val ? { id: k.name.replace('room:', ''), ...val } : null
          }),
        )
        return json(rooms.filter(Boolean))
      }
    }

    if (pathname.startsWith('/api/doodle/ws/')) {
      const roomId = pathname.slice('/api/doodle/ws/'.length)
      if (!roomId) return new Response('Missing room ID', { status: 400 })
      const stub = env.GAME_ROOMS.get(env.GAME_ROOMS.idFromName(roomId))
      return stub.fetch(request)
    }

    return new Response('Not found', { status: 404 })
  },
}
