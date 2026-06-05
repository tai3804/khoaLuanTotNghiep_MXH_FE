import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';

export function OverviewAppView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Tổng quan
      </Typography>
      <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
        Chào mừng bạn đến với hệ thống F88!
      </Box>
    </DashboardContent>
  );
}
