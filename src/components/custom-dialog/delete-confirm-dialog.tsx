import Button from '@mui/material/Button';

import { ConfirmDialog } from './confirm-dialog';

// ----------------------------------------------------------------------

type DeleteConfirmDialogProps = {
    open: boolean;
    loading?: boolean;
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
};

export function DeleteConfirmDialog({
    open,
    loading,
    itemName,
    onClose,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <ConfirmDialog
            open={open}
            onClose={onClose}
            title="Xác nhận xóa"
            content={`Bạn có chắc chắn muốn xóa "${itemName}"?`}
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    Xóa
                </Button>
            }
        />
    );
}
