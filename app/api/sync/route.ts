// Không còn cần sync vào DB — dữ liệu được lấy trực tiếp từ Shopify & Meta API
export async function POST() {
  return Response.json({ ok: true, message: 'Direct API mode — no sync needed' })
}
