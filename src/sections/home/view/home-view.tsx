import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function HomeView() {
  return (
    <Container sx={{ py: 10 }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h3">Welcome to App</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          This is the starting point for your personal API project.
        </Typography>
      </Stack>
    </Container>
  );
}
