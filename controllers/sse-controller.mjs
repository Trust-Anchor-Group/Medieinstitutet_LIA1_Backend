import { asyncHandler } from '../middleware/asyncHandler.mjs';
import { sseConnectionStore } from '../utilities/SSEConnectionStore.mjs';

export const handleSEEConnection = asyncHandler(async (req, res) => { 
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    
    res.write('data: {"type": "Connected"}\n\n');

    const cookie = req.cookies.session;
    if(!cookie) return;

    try {
        const cookieData = JSON.parse(cookie);
        sseConnectionStore.setConnection(cookieData.sessionId, res);

        req.on('close', () => {
            sseConnectionStore.removeConnection(cookieData.sessionId);
        })
    } catch (error) {
        console.log("SSE-Error", error);
        res.end();
    }
});