/**
 * Firestore document ids cannot contain "/", but instrument symbols such as
 * "BTC/USD" do. Use this helper whenever a symbol is used as a document id.
 */
export const watchlistDocId = (symbol: string) => symbol.replace(/\//g, "_");
