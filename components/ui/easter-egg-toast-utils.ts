export function pickReply(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}
