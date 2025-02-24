import { useState } from 'react'
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function ChatApp() {
  const [input, setInput] = useState('')

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await fetch(`${process.env.API_URL}/api/messages`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    }
  })

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`${process.env.API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content, codeBlocks: [] })
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
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
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Python & DSA Assistant</h1>
        {/* Messages will go here */}
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 text-white"
            placeholder="Ask a question..."
          />
        </form>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatApp />
    </QueryClientProvider>
  )
}
