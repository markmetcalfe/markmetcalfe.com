import { useQuery } from '@tanstack/vue-query'

export interface NetworkStatus {
  isConnected: boolean
  yourIp?: string
  homeIp?: string
}

export function useGetNetworkStatus() {
  return useQuery<NetworkStatus>({
    queryKey: ['network-status'],
    queryFn: async () => {
      const response = await fetch('/api/get-network-status')
      return await response.json()
    },
  })
}
