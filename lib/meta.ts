const TOKEN = process.env.META_ACCESS_TOKEN
const AD_ACCOUNT = process.env.META_AD_ACCOUNT_ID
const GRAPH = 'https://graph.facebook.com/v19.0'

export type MetaInsight = {
  spend: string
  impressions: string
  clicks: string
  reach: string
  date_start: string
  date_stop: string
  actions?: Array<{ action_type: string; value: string }>
}

export async function getAdSpend(dateStart: string, dateEnd: string): Promise<MetaInsight | null> {
  const params = new URLSearchParams({
    fields: 'spend,impressions,clicks,reach,actions',
    time_range: JSON.stringify({ since: dateStart, until: dateEnd }),
    access_token: TOKEN!,
    level: 'account',
  })

  const res = await fetch(`${GRAPH}/${AD_ACCOUNT}/insights?${params}`, {
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    console.error('Meta API error:', await res.text())
    return null
  }

  const data = await res.json()
  return data.data?.[0] ?? null
}

export async function getDailyAdSpend(dateStart: string, dateEnd: string): Promise<MetaInsight[]> {
  const params = new URLSearchParams({
    fields: 'spend,impressions,clicks,reach',
    time_range: JSON.stringify({ since: dateStart, until: dateEnd }),
    time_increment: '1',
    access_token: TOKEN!,
    level: 'account',
  })

  const res = await fetch(`${GRAPH}/${AD_ACCOUNT}/insights?${params}`, {
    next: { revalidate: 0 },
  })

  if (!res.ok) return []

  const data = await res.json()
  return data.data ?? []
}
