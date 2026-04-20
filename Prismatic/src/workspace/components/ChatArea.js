import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
export default function ChatArea({ messages, loading }) {
    const bottomRef = useRef(null);
    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    return (_jsxs("div", { className: "ws-chat", id: "ws-chat-area", children: [messages.map(msg => (_jsx(MessageBubble, { message: msg }, msg.id))), _jsx("div", { ref: bottomRef, style: { height: 1 } })] }));
}
