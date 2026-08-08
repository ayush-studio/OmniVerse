import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const token = useAuthStore((s) => s.token)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) {
      setSocket((prev) => {
        prev?.disconnect()
        return null
      })
      setConnected(false)
      return
    }

    const s = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [token])

  const value = useMemo(() => ({ socket, connected }), [socket, connected])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  return useContext(SocketContext) || { socket: null, connected: false }
}
