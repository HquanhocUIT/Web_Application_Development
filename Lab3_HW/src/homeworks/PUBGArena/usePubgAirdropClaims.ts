import { useCallback, useEffect, useRef, useState } from 'react'
import type { PubgClaimApi, PubgClaimableItem } from './pubgClaimApi'
import { PubgClaimApiError } from './pubgClaimApi'

export interface PubgClaimMessage {
  id: string
  itemId: string
  kind: 'success' | 'error'
  text: string
}

interface PendingClaim {
  controller: AbortController
  previousInventory: number
}

export interface PubgAirdropClaims {
  inventories: Readonly<Record<string, number>>
  pendingIds: ReadonlySet<string>
  messages: readonly PubgClaimMessage[]
  claim: (itemId: string) => Promise<void>
  cancelClaim: (itemId: string) => void
  clearMessage: (messageId: string) => void
}

export function usePubgAirdropClaims(
  items: readonly PubgClaimableItem[],
  api: PubgClaimApi,
): PubgAirdropClaims {
  const [inventories, setInventories] = useState<Record<string, number>>(() => Object.fromEntries(
    items.map((item) => [item.id, Math.max(0, api.getInventory(item.id))]),
  ))
  const inventoryRef = useRef(inventories)
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set())
  const pendingRef = useRef(new Set<string>())
  const requestsRef = useRef(new Map<string, PendingClaim>())
  const [messages, setMessages] = useState<PubgClaimMessage[]>([])
  const mountedRef = useRef(false)
  const nextMessageIdRef = useRef(0)
  const itemNamesRef = useRef(new Map(items.map((item) => [item.id, item.name])))

  const writeInventory = useCallback((itemId: string, value: number) => {
    const next = { ...inventoryRef.current, [itemId]: Math.max(0, value) }
    inventoryRef.current = next
    setInventories(next)
  }, [])

  const appendMessage = useCallback((itemId: string, kind: PubgClaimMessage['kind'], text: string) => {
    const message = {
      id: `${itemId}-${++nextMessageIdRef.current}`,
      itemId,
      kind,
      text,
    }
    setMessages((current) => [...current, message])
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      for (const request of requestsRef.current.values()) request.controller.abort()
      requestsRef.current.clear()
      pendingRef.current.clear()
    }
  }, [])

  const claim = useCallback(async (itemId: string) => {
    if (!mountedRef.current || pendingRef.current.has(itemId)) return
    const previousInventory = inventoryRef.current[itemId] ?? api.getInventory(itemId)
    if (previousInventory <= 0) return

    const controller = new AbortController()
    const request: PendingClaim = { controller, previousInventory }
    requestsRef.current.set(itemId, request)
    pendingRef.current.add(itemId)
    setPendingIds(new Set(pendingRef.current))
    writeInventory(itemId, previousInventory - 1)

    try {
      const serverInventory = await api.claim(itemId, previousInventory, controller.signal)
      if (!mountedRef.current || requestsRef.current.get(itemId) !== request || controller.signal.aborted) return

      writeInventory(itemId, serverInventory)
      const itemName = itemNamesRef.current.get(itemId) ?? 'Airdrop reward'
      appendMessage(itemId, 'success', `${itemName} claimed successfully. ${serverInventory} remaining.`)
    } catch (error) {
      if (!mountedRef.current || requestsRef.current.get(itemId) !== request) return

      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        writeInventory(itemId, previousInventory)
        return
      }

      if (error instanceof PubgClaimApiError && error.status === 409) {
        const authoritativeInventory = error.serverInventory ?? api.getInventory(itemId)
        writeInventory(itemId, authoritativeInventory)
        appendMessage(itemId, 'error', `Inventory changed on the server. ${authoritativeInventory} available; your count was refreshed.`)
      } else {
        writeInventory(itemId, previousInventory)
        appendMessage(itemId, 'error', 'The claim could not reach the server. Your inventory was restored; please try again.')
      }
    } finally {
      if (requestsRef.current.get(itemId) === request) {
        requestsRef.current.delete(itemId)
        pendingRef.current.delete(itemId)
        if (mountedRef.current) setPendingIds(new Set(pendingRef.current))
      }
    }
  }, [api, appendMessage, writeInventory])

  const cancelClaim = useCallback((itemId: string) => {
    const request = requestsRef.current.get(itemId)
    if (!request) return

    requestsRef.current.delete(itemId)
    pendingRef.current.delete(itemId)
    request.controller.abort()
    writeInventory(itemId, request.previousInventory)
    setPendingIds(new Set(pendingRef.current))
  }, [writeInventory])

  const clearMessage = useCallback((messageId: string) => {
    setMessages((current) => current.filter((message) => message.id !== messageId))
  }, [])

  return { inventories, pendingIds, messages, claim, cancelClaim, clearMessage }
}
