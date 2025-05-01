import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import ReservationForm from './pages/ReservationForm';
import AdminDashboard from './pages/AdminDashboard';

// テーマ設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App: React.FC = () => {
  // 表示ページの状態（ユーザー予約/管理画面）
  const [view, setView] = useState<'reservation' | 'admin'>('reservation');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              サンコーオート様　ピットサービス予約システム（プロトタイプ）
            </Typography>
            <Button 
              color="inherit" 
              onClick={() => setView('reservation')}
              variant={view === 'reservation' ? 'outlined' : 'text'}
            >
              予約画面
            </Button>
            <Button 
              color="inherit" 
              onClick={() => setView('admin')}
              variant={view === 'admin' ? 'outlined' : 'text'}
            >
              管理画面
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container>
          {view === 'reservation' ? <ReservationForm /> : <AdminDashboard />}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;