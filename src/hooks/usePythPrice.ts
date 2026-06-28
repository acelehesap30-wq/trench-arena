import { useState, useEffect } from 'react';
import { PriceServiceConnection, Price } from '@pythnetwork/price-service-client';

// Pyth Network Mainnet SOL/USD Price Feed ID
const SOL_USD_PRICE_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

export function usePythPrice() {
    const [price, setPrice] = useState<string | null>(null);
    const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

    useEffect(() => {
        let isMounted = true;
        
        // Hermes is the Pyth price service
        const connection = new PriceServiceConnection("https://hermes.pyth.network");
        let lastPriceVal = 0;

        const updatePrice = (priceInfo: Price) => {
            if (!isMounted) return;
            const priceVal = Number(priceInfo.price) * Math.pow(10, priceInfo.expo);
            
            if (lastPriceVal !== 0) {
                if (priceVal > lastPriceVal) setTrend('up');
                else if (priceVal < lastPriceVal) setTrend('down');
            }
            
            lastPriceVal = priceVal;
            setPrice(priceVal.toFixed(4));
        };

        // Fetch initial price
        connection.getLatestPriceFeeds([SOL_USD_PRICE_ID]).then((feeds) => {
            if (feeds && feeds.length > 0) {
                const currentPrice = feeds[0].getPriceUnchecked();
                if (currentPrice) updatePrice(currentPrice);
            }
        });

        // Subscribe to live price updates
        connection.subscribePriceFeedUpdates([SOL_USD_PRICE_ID], (feed) => {
            const currentPrice = feed.getPriceUnchecked();
            if (currentPrice) updatePrice(currentPrice);
        });

        return () => {
            isMounted = false;
            connection.unsubscribePriceFeedUpdates([SOL_USD_PRICE_ID], () => {});
            connection.closeWebSocket();
        };
    }, []);

    return { price, trend };
}
