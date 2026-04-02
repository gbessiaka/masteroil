'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'

interface UseOrdersOptions {
  status?: OrderStatus
  clientId?: string
  limit?: number
}

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  refetch: () => void
  updateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { status, clientId, limit = 50 } = options
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      let query = supabase
        .from('orders')
        .select(`
          *,
          client:clients(*),
          order_items(
            *,
            packaging:packagings(
              *,
              product:products(*)
            )
          )
        `)
        .order('date_commande', { ascending: false })
        .limit(limit)

      if (status) {
        query = query.eq('statut', status)
      }

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setOrders((data as Order[]) ?? [])
    } catch (err) {
      setError('Erreur lors du chargement des commandes.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [status, clientId, limit])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('orders')
        .update({ statut: newStatus })
        .eq('id', orderId)

      if (updateError) {
        setError(updateError.message)
        return false
      }

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, statut: newStatus } : o))
      )

      return true
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut.')
      console.error(err)
      return false
    }
  }

  return { orders, loading, error, refetch: fetchOrders, updateStatus }
}

export function useOrder(orderId: string): {
  order: Order | null
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(*),
          order_items(
            *,
            packaging:packagings(
              *,
              product:products(*)
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setOrder(data as Order)
    } catch (err) {
      setError('Erreur lors du chargement de la commande.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return { order, loading, error, refetch: fetchOrder }
}
