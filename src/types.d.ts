export interface Environment {
  REDIRECTS: KVNamespace
  DISCORD_IDS: KVNamespace
  SIGNS: KVNamespace
  IMAGES: R2Bucket
  STICKER_API_BASE: string
  TWITTER_CARD_PROXY: string
  FALLBACK_REDIRECT: string
  ZTICKER: string
  BUNNYPAWS: string
  // Service binding doesn't seem to work properly yet
  // STICKER_API: Fetcher
}
