import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Message } from '@/types'

export default function Home() {
  const [input, setInput] = useState('')

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/messages')
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    }
  })

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content, codeBlocks: [] })
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage.mutate(input)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Python & DSA Assistant
        </h1>

        <div className="space-y-6 mb-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-zinc-800 ml-12' 
                  : 'bg-zinc-800/50 mr-12'
              }`}
            >
              <p className="text-sm text-zinc-400 mb-2">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.codeBlocks.map((code, i) => (
                <pre key={i} className="mt-4 p-4 bg-zinc-900 rounded-md overflow-x-auto">
                  <code className="text-green-400">{code}</code>
                </pre>
              ))}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Python or DSA concepts..."
            className="flex-1 bg-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={sendMessage.isPending}
            className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}