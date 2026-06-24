import { NextRequest } from 'next/server'
import { getOrders } from '@/lib/shopify'
import { getAdSpend, getDailyAdSpend } from '@/lib/meta'
import { getCogMap } from '@/lib/products'
import { todayISO } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateStart = searchParams.get('start') || todayISO()
  const dateEnd = searchParams.get('end') || todayISO()
  const paymentFee = parseFloat(searchParams.get('fee') || '0') / 100

  const cogMap = await getCogMap()

  const [orders, adSummary, dailyAds] = await Promise.all([
    getOrders(dateStart, dateEnd),
    getAdSpend(dateStart, dateEnd),
    getDailyAdSpend(dateStart, dateEnd),
  ])

  let revenue = 0
  let cogs = 0
  const revenueByDay = new Map<string, number>()

  for (const order of orders) {
    const price = parseFloat(order.total_price)
    revenue += price
    const day = new Date(order.created_at).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
    revenueByDay.set(day, (revenueByDay.get(day) || 0) + price)
    for (const item of order.line_items || []) {
      cogs += (cogMap.get(item.sku) || 0) * item.quantity
    }
  }

  const adSpend = parseFloat(adSummary?.spend || '0')
  const feeAmount = revenue * paymentFee
  const grossProfit = revenue - cogs
  const netProfit = grossProfit - adSpend - feeAmount
  const roas = adSpend > 0 ? revenue / adSpend : 0
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  const totalClicks = parseInt(adSummary?.clicks || '0')
  const totalImpressions = parseInt(adSummary?.impressions || '0')
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const cpc = totalClicks > 0 ? adSpend / totalClicks : 0

  const allDates = new Set([
    ...revenueByDay.keys(),
    ...dailyAds.map((d) => d.date_start),
  ])
  const chartData = Array.from(allDates)
    .sort()
    .map((date) => {
      const rev = revenueByDay.get(date) || 0
      const spend = parseFloat(dailyAds.find((d) => d.date_start === date)?.spend || '0')
      return { date, revenue: rev, adSpend: spend, profit: rev - spend }
    })

  return Response.json({
    revenue, cogs, adSpend, feeAmount, grossProfit, netProfit,
    roas, margin, orderCount: orders.length,
    ctr, cpc, totalClicks, totalImpressions, chartData,
  })
}
