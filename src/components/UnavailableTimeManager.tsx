import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { 
  UnavailableTime, 
  UnavailableType 
} from '../types/UnavailableTime';
import {
  getUnavailableTimes,
  addUnavailableTime,
  updateUnavailableTime,
  deleteUnavailableTime,
} from '../utils/storageUtils';
import { formatDate, formatTime } from '../utils/dateUtils';

// 予約不可能な日時管理コンポーネント
const UnavailableTimeManager: React.FC = () => {
  // 予約不可能な日時リスト
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>([]);
  
  // ダイアログの表示状態
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // 編集中のデータID（新規の場合はnull）
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // フォーム入力値
  const [type, setType] = useState<UnavailableType>('day');
  const [date, setDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState<Date | null>(
    new Date(new Date().setHours(9, 0, 0, 0))
  );
  const [endTime, setEndTime] = useState<Date | null>(
    new Date(new Date().setHours(10, 0, 0, 0))
  );
  const [reason, setReason] = useState('');
  
  // 予約不可能な日時を読み込み
  useEffect(() => {
    loadUnavailableTimes();
  }, []);
  
  // 予約不可能な日時を読み込む
  const loadUnavailableTimes = () => {
    const times = getUnavailableTimes();
    setUnavailableTimes(times);
  };
  
  // ダイアログを開く（新規）
  const handleOpenDialog = () => {
    resetForm();
    setEditingId(null);
    setDialogOpen(true);
  };
  
  // ダイアログを開く（編集）
  const handleOpenEditDialog = (item: UnavailableTime) => {
    setEditingId(item.id);
    setType(item.type);
    setDate(item.date);
    setReason(item.reason);
    
    if (item.type === 'timeSlot') {
      setStartTime(item.startTime);
      setEndTime(item.endTime);
    }
    
    setDialogOpen(true);
  };
  
  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };
  
  // フォームをリセット
  const resetForm = () => {
    setType('day');
    setDate(new Date());
    setStartTime(new Date(new Date().setHours(9, 0, 0, 0)));
    setEndTime(new Date(new Date().setHours(10, 0, 0, 0)));
    setReason('');
  };
  
  // 予約不可能な日時を保存
  const handleSave = () => {
    if (!date) {
      alert('日付を選択してください');
      return;
    }
    
    if (type === 'timeSlot' && (!startTime || !endTime)) {
      alert('開始時間と終了時間を選択してください');
      return;
    }
    
    if (type === 'timeSlot' && startTime && endTime && startTime >= endTime) {
      alert('終了時間は開始時間より後に設定してください');
      return;
    }
    
    if (!reason.trim()) {
      alert('理由を入力してください');
      return;
    }
    
    // 保存するデータを作成
    let unavailableTime: UnavailableTime;
    
    if (type === 'day') {
      unavailableTime = {
        id: editingId || uuidv4(),
        type: 'day',
        date: date,
        reason: reason,
      };
    } else {
      // timeSlotの場合
      if (!startTime || !endTime) return; // TypeScriptのnull型チェックのため
      
      unavailableTime = {
        id: editingId || uuidv4(),
        type: 'timeSlot',
        date: date,
        startTime: startTime,
        endTime: endTime,
        reason: reason,
      };
    }
    
    // 新規か編集かで処理を分岐
    if (editingId) {
      updateUnavailableTime(unavailableTime);
    } else {
      addUnavailableTime(unavailableTime);
    }
    
    // データを再読み込み
    loadUnavailableTimes();
    
    // ダイアログを閉じる
    handleCloseDialog();
  };
  
  // 予約不可能な日時を削除
  const handleDelete = (id: string) => {
    if (window.confirm('この予約不可設定を削除してもよろしいですか？')) {
      deleteUnavailableTime(id);
      loadUnavailableTimes();
    }
  };
  
  // リストアイテムのラベルを生成
  const getItemLabel = (item: UnavailableTime): string => {
    if (item.type === 'day') {
      return `${formatDate(item.date)} 終日 - ${item.reason}`;
    } else {
      return `${formatDate(item.date)} ${formatTime(item.startTime)}〜${formatTime(item.endTime)} - ${item.reason}`;
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">予約不可能な日時の管理</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          新規追加
        </Button>
      </Box>
      
      <List>
        {unavailableTimes.length === 0 ? (
          <ListItem>
            <ListItemText primary="予約不可設定はありません" />
          </ListItem>
        ) : (
          unavailableTimes.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={getItemLabel(item)}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>
      
      {/* 編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? '予約不可設定を編集' : '予約不可設定を追加'}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                タイプ
              </Typography>
              <RadioGroup
                row
                value={type}
                onChange={(e) => setType(e.target.value as UnavailableType)}
              >
                <FormControlLabel value="day" control={<Radio />} label="終日" />
                <FormControlLabel value="timeSlot" control={<Radio />} label="時間帯" />
              </RadioGroup>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DatePicker
                    label="日付"
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </Grid>
                
                {type === 'timeSlot' && (
                  <>
                    <Grid item xs={6}>
                      <TimePicker
                        label="開始時間"
                        value={startTime}
                        onChange={(newTime) => setStartTime(newTime)}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TimePicker
                        label="終了時間"
                        value={endTime}
                        onChange={(newTime) => setEndTime(newTime)}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    label="理由"
                    fullWidth
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    margin="normal"
                    placeholder="休業日、スタッフ不在など"
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            キャンセル
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UnavailableTimeManager;