import { useState, useCallback } from 'react';

import { toast } from 'sonner';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type RowActionPaths = {
    edit: (id: string) => string;
    new?: string;
    pdf?: (id: string) => string;
};

type UseTableRowActionsConfig<TRow extends { id: string }> = {
    /** Mảng data hiện tại (để look up row theo id) */
    items: TRow[];
    /** Các path builder của module */
    paths: RowActionPaths;
    /** Hàm xóa (module-specific hoặc deleteEntity) */
    deleteFn: (id: string) => Promise<any>;
    /** Lấy tên hiển thị cho dialog xóa */
    getItemName: (row: TRow) => string;
    /** Callback sau khi xóa thành công (gọi mutate(), cleanup selectedIds...) */
    onDeleteSuccess?: (id: string) => void;
    /** State truyền qua router khi edit (một số module cần) */
    getEditState?: (row: TRow) => Record<string, any>;
    /** Trích fields cần sao chép từ row */
    getDuplicateData?: (row: TRow) => Record<string, any>;
};

type DeleteDialogProps = {
    open: boolean;
    onClose: () => void;
    itemName: string;
    onConfirm: () => void;
    loading: boolean;
};

type UseTableRowActionsReturn = {
    handleEditRow: (id: string) => void;
    handleDeleteRow: (id: string) => void;
    handleViewPdf: (id: string) => void;
    handleDuplicate: (id: string) => void;
    deleteDialogProps: DeleteDialogProps;
};

// ----------------------------------------------------------------------

export function useTableRowActions<TRow extends { id: string }>(
    config: UseTableRowActionsConfig<TRow>
): UseTableRowActionsReturn {
    const {
        items,
        paths: actionPaths,
        deleteFn,
        getItemName,
        onDeleteSuccess,
        getEditState,
        getDuplicateData,
    } = config;

    const router = useRouter();

    const [deleteData, setDeleteData] = useState<{ id: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // --- Edit ---
    const handleEditRow = useCallback(
        (id: string) => {
            if (getEditState) {
                const row = items.find((item) => item.id === id);
                if (row) {
                    router.push(actionPaths.edit(id), { state: getEditState(row) });
                    return;
                }
            }
            router.push(actionPaths.edit(id));
        },
        [router, actionPaths, items, getEditState]
    );

    // --- Delete: open dialog ---
    const handleDeleteRow = useCallback(
        (id: string) => {
            const row = items.find((item) => item.id === id);
            if (row) {
                setDeleteData({ id: row.id, name: getItemName(row) });
            }
        },
        [items, getItemName]
    );

    // --- Delete: confirm ---
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteData) return;
        setDeleting(true);
        try {
            await deleteFn(deleteData.id);
            toast.success('Xóa thành công!');
            onDeleteSuccess?.(deleteData.id);
            setDeleteData(null);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || error.message || 'Xóa thất bại!';
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    }, [deleteData, deleteFn, onDeleteSuccess]);

    // --- Delete: cancel ---
    const handleCancelDelete = useCallback(() => {
        setDeleteData(null);
    }, []);

    // --- View PDF ---
    const handleViewPdf = useCallback(
        (id: string) => {
            if (actionPaths.pdf) {
                router.push(actionPaths.pdf(id));
            }
        },
        [router, actionPaths]
    );

    // --- Duplicate ---
    const handleDuplicate = useCallback(
        (id: string) => {
            if (!actionPaths.new || !getDuplicateData) return;
            const row = items.find((item) => item.id === id);
            if (row) {
                router.push(actionPaths.new, {
                    state: { duplicate: getDuplicateData(row) },
                });
            }
        },
        [router, actionPaths, items, getDuplicateData]
    );

    // --- Dialog props ---
    const deleteDialogProps: DeleteDialogProps = {
        open: !!deleteData,
        onClose: handleCancelDelete,
        itemName: deleteData?.name || '',
        onConfirm: handleConfirmDelete,
        loading: deleting,
    };

    return {
        handleEditRow,
        handleDeleteRow,
        handleViewPdf,
        handleDuplicate,
        deleteDialogProps,
    };
}
