import React, { useState, useEffect } from 'react';
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
  Badge,
} from '@mui/material';
import ReservationForm from './pages/ReservationForm';
import AdminDashboard from './pages/AdminDashboard';
import { getReservations, initializeWithSampleData } from './utils/storageUtils';
import { Reservation } from './types/Reservation';

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
  
  // 予約データ
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // 今日の予約数
  const [todayReservationsCount, setTodayReservationsCount] = useState(0);
  
  // サンプルデータの初期化（初回のみ）
  useEffect(() => {
    initializeWithSampleData();
    loadReservations();
  }, []);
  
  // 予約データの読み込み
  const loadReservations = () => {
    const data = getReservations();
    setReservations(data);
    
    // 今日の予約数をカウント
    const today = new Date();
    const todayCount = data.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return (
        reservationDate.getFullYear() === today.getFullYear() &&
        reservationDate.getMonth() === today.getMonth() &&
        reservationDate.getDate() === today.getDate()
      );
    }).length;
    
    setTodayReservationsCount(todayCount);
  };
  
  // 画面切り替え時に予約データを更新
  const handleViewChange = (newView: 'reservation' | 'admin') => {
    loadReservations();
    setView(newView);
  };
  
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
              onClick={() => handleViewChange('reservation')}
              variant={view === 'reservation' ? 'outlined' : 'text'}
            >
              予約画面
            </Button>
            <Button 
              color="inherit" 
              onClick={() => handleViewChange('admin')}
              variant={view === 'admin' ? 'outlined' : 'text'}
            >
              管理画面
              {todayReservationsCount > 0 && (
                <Badge
                  color="secondary"
                  badgeContent={todayReservationsCount}
                  sx={{ ml: 1 }}
                />
              )}
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