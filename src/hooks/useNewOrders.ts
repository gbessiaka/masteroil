'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNewOrders() {
  const [count, setCount] = useState(0)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchCount() {
      const { count: c } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'nouveau')
      setCount(c ?? 0)
      initialLoadDone.current = true
    }

    fetchCount()

    const channel = supabase
      .channel('new-orders-notif')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new?.status === 'nouveau') {
            setCount((prev) => prev + 1)

            // Notification navigateur
            if (typeof window !== 'undefined' && 'Notification' in window) {
              const notify = () => {
                new Notification('Nouvelle commande — Master Oil Guinée', {
                  body: 'Une nouvelle commande vient d\'être enregistrée.',
                  icon: '/images/logo.png',
                })
              }

              if (Notification.permission === 'granted') {
                notify()
              } else if (Notification.permission === 'default') {
                Notification.requestPermission().then((p) => {
                  if (p === 'granted') notify()
                })
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          // Recalcule le count quand un statut change
          fetchCount()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return count
}
