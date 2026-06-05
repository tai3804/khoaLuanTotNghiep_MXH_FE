export const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'đang hoạt động':
            return 'success';
        case 'ngừng hoạt động':
            return 'default';
        default:
            return 'error';
    }
};