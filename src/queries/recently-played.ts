import { useQuery } from '@tanstack/vue-query'

export interface Track {
  name: string
  artist: string
  album: string
  image: string
  timestamp: string
  url: string
}

export function useGetLastPlayedTrack() {
  return useQuery<Track>({
    queryKey: ['last-played'],
    queryFn: async () => {
      const response = await fetch('/api/get-last-played')
      return await response.json()
    },
  })
}
