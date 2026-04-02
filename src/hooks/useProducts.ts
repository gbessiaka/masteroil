'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

interface UseProductsOptions {
  category?: string
  oilType?: string
  searchQuery?: string
  activeOnly?: boolean
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    category,
    oilType,
    searchQuery,
    activeOnly = true,
  } = options

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      let query = supabase
        .from('products')
        .select(`
          *,
          packagings (*)
        `)
        .order('nom', { ascending: true })

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      if (category) {
        query = query.eq('categorie', category)
      }

      if (oilType) {
        query = query.eq('oil_type', oilType)
      }

      if (searchQuery) {
        query = query.ilike('nom', `%${searchQuery}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setProducts((data as Product[]) ?? [])
    } catch (err) {
      setError('Une erreur est survenue lors du chargement des produits.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [category, oilType, searchQuery, activeOnly])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(idOrSlug: string): {
  product: Product | null
  loading: boolean
  error: string | null
} {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        const isUUID = /^[0-9a-f-]{36}$/i.test(idOrSlug)

        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`
            *,
            packagings (*)
          `)
          .eq(isUUID ? 'id' : 'slug', idOrSlug)
          .single()

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setProduct(data as Product)
      } catch (err) {
        setError('Une erreur est survenue lors du chargement du produit.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (idOrSlug) {
      fetchProduct()
    }
  }, [idOrSlug])

  return { product, loading, error }
}
