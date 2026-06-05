import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_THRESHOLD = 8;

type UseListboxLoadMoreOptions = {
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    threshold?: number;
    firstLoadDelayMs?: number;
};

export function useListboxLoadMore({
    isLoading,
    hasMore,
    onLoadMore,
    threshold = DEFAULT_THRESHOLD,
    firstLoadDelayMs = 0,
}: UseListboxLoadMoreOptions) {
    const [isPending, setIsPending] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const delayAppliedRef = useRef(false);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isLoading && !timerRef.current) {
            setIsPending(false);
        }
    }, [isLoading]);

    useEffect(() => () => {
        clearTimer();
    }, [clearTimer]);

    const triggerLoadMore = useCallback(() => {
        if (isLoading || isPending || !hasMore) return;

        setIsPending(true);

        const shouldDelay = firstLoadDelayMs > 0 && !delayAppliedRef.current;
        if (!shouldDelay) {
            onLoadMore();
            return;
        }

        clearTimer();
        timerRef.current = setTimeout(() => {
            onLoadMore();
            delayAppliedRef.current = true;
            timerRef.current = null;
        }, firstLoadDelayMs);
    }, [clearTimer, firstLoadDelayMs, hasMore, isLoading, isPending, onLoadMore]);

    const onListboxScroll = useCallback((listNode: HTMLElement) => {
        const isAtBottom = listNode.scrollTop + listNode.clientHeight >= listNode.scrollHeight - threshold;
        if (isAtBottom) {
            triggerLoadMore();
        }
    }, [threshold, triggerLoadMore]);

    const onListboxWheel = useCallback((listNode: HTMLElement, deltaY: number) => {
        const canScroll = listNode.scrollHeight > listNode.clientHeight;

        if (!canScroll && deltaY > 0) {
            triggerLoadMore();
            return;
        }

        onListboxScroll(listNode);
    }, [onListboxScroll, triggerLoadMore]);

    const reset = useCallback(() => {
        clearTimer();
        setIsPending(false);
        delayAppliedRef.current = false;
    }, [clearTimer]);

    return {
        isPending,
        onListboxScroll,
        onListboxWheel,
        reset,
    };
}
