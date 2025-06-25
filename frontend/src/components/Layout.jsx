import React from 'react';
import { Container, Grid } from '@mui/material';

export default function Layout({ children }) {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {React.Children.map(children, (child, idx) => (
          <Grid item xs={12} md={6} lg={4} key={idx}>
            {child}
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 