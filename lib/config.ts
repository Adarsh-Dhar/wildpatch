export const gameConfig = {
  features: {
    debugPanel: process.env.NODE_ENV !== "production",
    sandboxRoute: true,
  },
  assetBasePath: "/game-assets",
  challengeCountdownSeconds: 8 * 60 * 42,
};

export function assetUrl(file: string) {
  return `${gameConfig.assetBasePath}/${file.replace(/^\/+/, "")}`;
}
