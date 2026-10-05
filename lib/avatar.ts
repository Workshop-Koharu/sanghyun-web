export function getDefaultDiscordAvatar(userId?: string | number | null): string {
  if (!userId) return 'https://cdn.discordapp.com/embed/avatars/0.png';
  try {
    const idx = Number(BigInt(String(userId)) >> BigInt(22)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${Math.abs(idx)}.png`;
  } catch {
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  }
}
