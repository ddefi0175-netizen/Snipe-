
export const getFallbackCryptoData = () => [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 94250, price_change_percentage_24h: 2.35, market_cap: 1850000000000, total_volume: 45000000000, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3420, price_change_percentage_24h: 1.82, market_cap: 410000000000, total_volume: 18000000000, image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { id: 'tether', name: 'Tether', symbol: 'usdt', current_price: 1.00, price_change_percentage_24h: 0.01, market_cap: 137000000000, total_volume: 85000000000, image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
];

export const getFallbackCryptoNews = () => [
    { title: 'Bitcoin Surges Past $94K as Institutional Interest Grows', source: 'CoinDesk', published_on: Date.now()/1000 - 3600, url: 'https://coindesk.com' },
    { title: 'Ethereum 2.0 Staking Rewards Hit New Highs', source: 'Decrypt', published_on: Date.now()/1000 - 7200, url: 'https://decrypt.co' },
    { title: 'Solana DeFi TVL Reaches $10B Milestone', source: 'The Block', published_on: Date.now()/1000 - 14400, url: 'https://theblock.co' },
];

export const getStockData = () => [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 254.32, change: 1.24, marketCap: 3900000000000, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 436.78, change: 0.85, marketCap: 3250000000000, sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 192.45, change: -0.32, marketCap: 2380000000000, sector: 'Technology' },
];

export const getStockNews = () => [
    { title: 'NVIDIA Announces New AI Chip Lineup for 2025', source: 'Reuters', time: '2h ago', url: 'https://reuters.com' },
    { title: 'Apple Vision Pro Sales Exceed Expectations', source: 'CNBC', time: '4h ago', url: 'https://cnbc.com' },
    { title: 'Fed Signals Potential Rate Cuts in Q1 2025', source: 'WSJ', time: '6h ago', url: 'https://wsj.com' },
];
