'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StockLevel, StockMovement } from '@/types'

interface UseStockReturn {
  stockLevels: StockLevel[]
  loading: boolean
  error: string | null
  refetch: () => void
  lowStockItems: StockLevel[]
  outOfStockItems: StockLevel[]
}

export function useStock(): UseStockReturn {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStock = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('stock_levels')
        .select('*')
        .order('product_nom', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setStockLevels((data as StockLevel[]) ?? [])
    } catch (err) {
      setError('Erreur lors du chargement des stocks.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Real-time subscription
  useEffect(() => {
    fetchStock()

    const supabase = createClient()

    const subscription = supabase
      .channel('stock_movements_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_movements' },
        () => {
          fetchStock()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchStock])

  const lowStockItems = stockLevels.filter(
    (s) => s.stock_actuel > 0 && s.stock_actuel <= s.seuil_alerte
  )

  const outOfStockItems = stockLevels.filter((s) => s.stock_actuel <= 0)

  return {
    stockLevels,
    loading,
    error,
    refetch: fetchStock,
    lowStockItems,
    outOfStockItems,
  }
}

interface UseStockMovementsReturn {
  movements: StockMovement[]
  loading: boolean
  error: string | null
  addMovement: (movement: {
    packaging_id: string
    type: 'entree' | 'sortie' | 'ajustement'
    quantite: number
    notes?: string
  }) => Promise<boolean>
}

export function useStockMovements(packagingId?: string): UseStockMovementsReturn {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMovements() {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        let query = supabase
          .from('stock_movements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (packagingId) {
          query = query.eq('packaging_id', packagingId)
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setMovements((data as StockMovement[]) ?? [])
      } catch (err) {
        setError('Erreur lors du chargement des mouvements.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovements()
  }, [packagingId])

  const addMovement = async (movement: {
    packaging_id: string
    type: 'entree' | 'sortie' | 'ajustement'
    quantite: number
    notes?: string
  }): Promise<boolean> => {
    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('stock_movements')
        .insert(movement)

      if (insertError) {
        setError(insertError.message)
        return false
      }

      return true
    } catch (err) {
      setError('Erreur lors de l\'ajout du mouvement.')
      console.error(err)
      return false
    }
  }

  return { movements, loading, error, addMovement }
}
