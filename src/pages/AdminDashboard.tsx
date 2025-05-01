import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { formatDate, formatTime } from '../utils/dateUtils';
import { Reservation } from '../types/Reservation';
import { UnavailableTime } from '../types/UnavailableTime';
import { staffMembers } from '../data/serviceMenu';
import { services } from '../data/serviceMenu';
import { 
  getReservations, 
  updateReservation, 
  deleteReservation, 
  initializeWithSampleData,
  getUnavailableTimes 
} from '../utils/storageUtils';
import UnavailableTimeManager from '../components/UnavailableTimeManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// 一週間の日付を生成
const getWeekDates = (currentDate: Date): Date[] => {
  const dates: Date[] = [];
  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // 日曜日から始める
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

// 日付が同じかどうかをチェック（年月日のみ）
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const AdminDashboard: React.FC = () => {
  // 表示モード（週表示/日表示/設定）
  const [tabValue, setTabValue] = useState(0);
  
  // 現在表示している週/日
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 週の日付配列
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  // 予約リスト
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // 予約不可能な日時リスト
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>([]);
  
  // 編集中の予約ID
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 編集中のメモ
  const [editingNotes, setEditingNotes] = useState<string>('');
  
  // 編集中の担当者
  const [editingStaff, setEditingStaff] = useState<string>('');
  
  // 通知メッセージ
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // サンプルデータの初期化（初回のみ）
  useEffect(() => {
    initializeWithSampleData();
  }, []);
  
  // 予約データの読み込み
  useEffect(() => {
    loadReservations();
    loadUnavailableTimes();
  }, []);
  
  // 週の日付を更新
  useEffect(() => {
    setWeekDates(getWeekDates(currentDate));
  }, [currentDate]);
  
  // 予約データを読み込む
  const loadReservations = () => {
    const data = getReservations();
    setReservations(data);
  };
  
  // 予約不可能な日時を読み込む
  const loadUnavailableTimes = () => {
    const times = getUnavailableTimes();
    setUnavailableTimes(times);
  };
  
  // 通知を表示
  const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };
  
  // 通知を閉じる
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };
  
  // タブを切り替え
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // 予約不可設定タブに切り替えた場合、データを再読み込み
    if (newValue === 2) {
      loadUnavailableTimes();
    }
  };
  
  // 前の週/日へ
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (tabValue === 0) { // 週表示
      newDate.setDate(newDate.getDate() - 7);
    } else { // 日表示
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };
  
  // 次の週/日へ
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (tabValue === 0) { // 週表示
      newDate.setDate(newDate.getDate() + 7);
    } else { // 日表示
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };
  
  // 予約の編集を開始
  const handleEditStart = (reservation: Reservation) => {
    setEditingId(reservation.id);
    setEditingNotes(reservation.notes || '');
    setEditingStaff(reservation.assignedStaff || '');
  };
  
  // 予約の編集をキャンセル
  const handleEditCancel = () => {
    setEditingId(null);
  };
  
  // 予約の編集を保存
  const handleEditSave = (id: string) => {
    const reservationToUpdate = reservations.find(r => r.id === id);
    
    if (!reservationToUpdate) {
      showNotification('予約データが見つかりません', 'error');
      return;
    }
    
    const updatedReservation: Reservation = {
      ...reservationToUpdate,
      notes: editingNotes,
      assignedStaff: editingStaff || undefined,
    };
    
    // ローカルストレージに保存
    const success = updateReservation(updatedReservation);
    
    if (success) {
      // 画面のリストも更新
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.id === id ? updatedReservation : reservation
        )
      );
      
      showNotification('予約が更新されました', 'success');
    } else {
      showNotification('予約の更新に失敗しました', 'error');
    }
    
    setEditingId(null);
  };
  
  // 予約を削除
  const handleDeleteReservation = (id: string) => {
    if (window.confirm('この予約を削除してもよろしいですか？')) {
      const success = deleteReservation(id);
      
      if (success) {
        // 画面のリストも更新
        setReservations(prevReservations => 
          prevReservations.filter(reservation => reservation.id !== id)
        );
        
        showNotification('予約が削除されました', 'info');
      } else {
        showNotification('予約の削除に失敗しました', 'error');
      }
    }
  };
  
  // サービス名を取得
  const getServiceName = (reservation: Reservation): string => {
    const service = services.find(s => s.id === reservation.service.serviceId);
    
    if (!service) return '不明なサービス';
    
    const option = reservation.service.optionId
      ? service.options?.find(o => o.id === reservation.service.optionId)
      : null;
    
    return option
      ? `${service.name} (${option.name})`
      : service.name;
  };
  
  // 担当者名を取得
  const getStaffName = (staffId?: string): string => {
    if (!staffId) return '未割り当て';
    return staffMembers.find(s => s.id === staffId)?.name || '不明なスタッフ';
  };
  
  // 特定の日付の予約を取得
  const getReservationsByDate = (date: Date): Reservation[] => {
    return reservations.filter(reservation => isSameDay(reservation.date, date));
  };
  
  // 日付が予約不可かどうかをチェック
  const isDateUnavailable = (date: Date): boolean => {
    return unavailableTimes.some(time => 
      time.type === 'day' && isSameDay(time.date, date)
    );
  };
  
  // 時間枠が予約不可かどうかをチェック
  const isTimeSlotUnavailable = (date: Date, hour: number, minute: number): boolean => {
    const targetTime = new Date(date);
    targetTime.setHours(hour, minute, 0, 0);
    
    return unavailableTimes.some(time => {
      if (time.type !== 'timeSlot') return false;
      if (!isSameDay(time.date, date)) return false;
      
      const start = time.startTime;
      const end = time.endTime;
      
      return targetTime >= start && targetTime < end;
    });
  };
  
  // 週表示のレンダリング
  const renderWeekView = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="120px">時間</TableCell>
              {weekDates.map((date, index) => (
                <TableCell 
                  key={index} 
                  align="center"
                  sx={{
                    bgcolor: isDateUnavailable(date) ? 'error.light' : 'inherit',
                    position: 'relative',
                  }}
                >
                  {formatDate(date)}
                  {isDateUnavailable(date) && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 5, 
                      color: 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <EventIcon fontSize="small" />
                    </Box>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 営業時間（9:00-18:00）を30分単位で表示 */}
            {Array.from({ length: 18 }, (_, i) => {
              const hour = Math.floor(i / 2) + 9;
              const minute = (i % 2) * 30;
              const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              
              return (
                <TableRow key={timeStr}>
                  <TableCell>{timeStr}</TableCell>
                  {weekDates.map((date, dateIndex) => {
                    const cellDate = new Date(date);
                    cellDate.setHours(hour, minute, 0, 0);
                    
                    // この時間枠が予約不可かどうかをチェック
                    const isUnavailable = isTimeSlotUnavailable(date, hour, minute);
                    
                    // この時間枠に該当する予約を探す
                    const reservation = reservations.find(r => 
                      isSameDay(r.date, date) && 
                      r.startTime.getHours() === hour && 
                      r.startTime.getMinutes() === minute
                    );
                    
                    // 予約不可の場合、背景色を変える
                    if (isUnavailable && !reservation) {
                      return (
                        <TableCell 
                          key={dateIndex}
                          sx={{
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                            position: 'relative',
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="caption">予約不可</Typography>
                          </Box>
                        </TableCell>
                      );
                    }
                    
                    if (!reservation) {
                      return <TableCell key={dateIndex} />;
                    }
                    
                    // 予約の時間枠を計算（30分単位）
                    const durationInMinutes = 
                      (reservation.endTime.getTime() - reservation.startTime.getTime()) / (1000 * 60);
                    const rowSpan = Math.ceil(durationInMinutes / 30);
                    
                    return (
                      <TableCell
                        key={dateIndex}
                        rowSpan={rowSpan}
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          border: '1px solid',
                          borderColor: 'primary.main',
                          position: 'relative',
                        }}
                      >
                        <Typography variant="subtitle2">
                          {getServiceName(reservation)}
                        </Typography>
                        <Typography variant="body2">
                          {reservation.customer.name}
                        </Typography>
                        <Typography variant="caption" display="block">
                          担当: {getStaffName(reservation.assignedStaff)}
                        </Typography>
                        <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditStart(reservation)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // 日表示のレンダリング
  const renderDayView = () => {
    const dayReservations = getReservationsByDate(currentDate);
    const isDayUnavailable = isDateUnavailable(currentDate);
    
    return (
      <Paper>
        <Box p={2}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Typography variant="h6">
              {formatDate(currentDate)}の予約一覧
            </Typography>
            
            {isDayUnavailable && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'error.main',
                bgcolor: 'error.light',
                px: 2,
                py: 0.5,
                borderRadius: 1,
              }}>
                <EventIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  予約不可日
                </Typography>
              </Box>
            )}
          </Box>
          
          {dayReservations.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" py={4}>
              予約はありません
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {dayReservations.map((reservation) => (
                <Grid item xs={12} key={reservation.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2">時間</Typography>
                        <Typography variant="body1">
                          {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2">サービス</Typography>
                        <Typography variant="body1">
                          {getServiceName(reservation)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2">お客様</Typography>
                        <Typography variant="body1">
                          {reservation.customer.name}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {reservation.customer.phone}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
  <Typography variant="subtitle2">お客様</Typography>
  <Typography variant="body1">
    {reservation.customer.name}
  </Typography>
  <Typography variant="caption" display="block">
    {reservation.customer.phone}
  </Typography>
</Grid>

{/* 顧客の備考欄を新しいアイテムとして追加 */}
<Grid item xs={12}>
  <Typography variant="subtitle2">お客様備考</Typography>
  <Typography variant="body2" sx={{ 
    fontStyle: 'italic',
    color: 'text.secondary',
    bgcolor: 'grey.50',
    p: 1,
    borderRadius: 1,
    minHeight: '24px'
  }}>
    {reservation.customer.notes || '(備考なし)'}
  </Typography>
</Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2">担当者</Typography>
                        {editingId === reservation.id ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editingStaff}
                              onChange={(e) => setEditingStaff(e.target.value)}
                            >
                              <MenuItem value="">未割り当て</MenuItem>
                              {staffMembers.map((staff) => (
                                <MenuItem key={staff.id} value={staff.id}>
                                  {staff.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body1">
                            {getStaffName(reservation.assignedStaff)}
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">メモ</Typography>
                        {editingId === reservation.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body2">
                            {reservation.notes || '(メモなし)'}
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sx={{ textAlign: 'right' }}>
                        {editingId === reservation.id ? (
                          <>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditSave(reservation.id)}
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton
                              color="default"
                              onClick={handleEditCancel}
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditStart(reservation)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteReservation(reservation.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          予約管理
        </Typography>
        
        {/* 表示切り替えタブ */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="週表示" />
            <Tab label="日表示" />
            <Tab label="予約不可設定" />
          </Tabs>
        </Box>
        
        {/* 日付ナビゲーション（予約不可設定タブでは非表示） */}
        {tabValue !== 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button startIcon={<ChevronLeft />} onClick={handlePrevious}>
              {tabValue === 0 ? '前の週' : '前日'}
            </Button>
            
            <Typography variant="h6">
              {tabValue === 0 && weekDates.length >= 7
                ? `${formatDate(weekDates[0])} 〜 ${formatDate(weekDates[6])}`
                : formatDate(currentDate)
              }
            </Typography>
            
            <Button endIcon={<ChevronRight />} onClick={handleNext}>
              {tabValue === 0 ? '次の週' : '翌日'}
            </Button>
          </Box>
        )}
        
        {/* 表示コンテンツ */}
        <TabPanel value={tabValue} index={0}>
          {renderWeekView()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderDayView()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {/* 予約不可設定の管理コンポーネント */}
          <UnavailableTimeManager />
        </TabPanel>
        
        {/* 通知メッセージ */}
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;