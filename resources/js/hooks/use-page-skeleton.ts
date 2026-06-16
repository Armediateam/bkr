import { useEffect, useState } from 'react';

export function usePageSkeleton(delay = 1000): boolean {
    const [showSkeleton, setShowSkeleton] = useState(true);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setShowSkeleton(false);
        }, delay);

        return () => window.clearTimeout(timeoutId);
    }, [delay]);

    return showSkeleton;
}
