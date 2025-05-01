import React from 'react';
import { Grid, Button, Paper, Typography, Box, styled } from '@mui/material';
import { TimeSlot } from '../types/Reservation';
import { formatTime } from '../utils/dateUtils';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedTime: Date | null;
  onTimeSelect: (time: Date) => void;
  serviceDuration: number;
}

const SlotButton = styled(Button)<{ isAvailable: boolean, isSelected: boolean }>(({ theme, isAvailable, isSelected }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  padding: theme.spacing(1),
  backgroundColor: isSelected 
    ? theme.palette.primary.main 
    : isAvailable 
      ? theme.palette.background.paper 
      : theme.palette.grey[200],
  color: isSelected 
    ? theme.palette.primary.contrastText 
    : isAvailable 
      ? theme.palette.text.primary 
      : theme.palette.text.disabled,
  borderLeft: isSelected ? `4px solid ${theme.palette.primary.dark}` : 'none',
  '&:hover': {
    backgroundColor: isSelected 
      ? theme.palette.primary.dark 
      : isAvailable 
        ? theme.palette.action.hover 
        : theme.palette.grey[200],
  },
}));

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  slots,
  selectedTime,
  onTimeSelect,
  serviceDuration,
}) => {
  // 時間帯ごとにグループ化（午前/午後）
  const morningSlots = slots.filter(slot => slot.startTime.getHours() < 12);
  const afternoonSlots = slots.filter(slot => slot.startTime.getHours() >= 12);

  // 選択されたスロットが有効かチェック
  const isValidSelection = (slot: TimeSlot): boolean => {
    if (!slot.isAvailable) return false;
    
    // サービス時間が30分より長い場合、連続するスロットが利用可能か確認
    if (serviceDuration <= 30) return true;
    
    const requiredSlots = Math.ceil(serviceDuration / 30);
    const startIndex = slots.findIndex(s => s.startTime === slot.startTime);
    
    // 必要な数のスロットが存在し、すべて利用可能か確認
    for (let i = 0; i < requiredSlots; i++) {
      const index = startIndex + i;
      if (index >= slots.length || !slots[index].isAvailable) {
        return false;
      }
    }
    
    return true;
  };

  // スロットが選択されているかをチェック
  const isSelected = (slotTime: Date): boolean => {
    return selectedTime !== null && 
           slotTime.getHours() === selectedTime.getHours() && 
           slotTime.getMinutes() === selectedTime.getMinutes();
  };

  // 選択可能な最終スロットのインデックスを計算
  // (サービス時間が長い場合、後半のスロットは選択できない)
  const getLastValidSlotIndex = (): number => {
    const requiredSlots = Math.ceil(serviceDuration / 30);
    return slots.length - requiredSlots;
  };

  const lastValidIndex = getLastValidSlotIndex();

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        時間を選択
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="primary">
          午前
        </Typography>
        <Grid container spacing={1}>
          {morningSlots.map((slot, index) => {
            const slotIndex = slots.findIndex(s => s.startTime === slot.startTime);
            const canSelect = slotIndex <= lastValidIndex && isValidSelection(slot);
            
            return (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <SlotButton
                  variant="outlined"
                  isAvailable={canSelect}
                  isSelected={isSelected(slot.startTime)}
                  onClick={() => canSelect && onTimeSelect(slot.startTime)}
                  disabled={!canSelect}
                >
                  {formatTime(slot.startTime)}
                </SlotButton>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      
      <Box>
        <Typography variant="subtitle1" color="primary">
          午後
        </Typography>
        <Grid container spacing={1}>
          {afternoonSlots.map((slot, index) => {
            const slotIndex = slots.findIndex(s => s.startTime === slot.startTime);
            const canSelect = slotIndex <= lastValidIndex && isValidSelection(slot);
            
            return (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <SlotButton
                  variant="outlined"
                  isAvailable={canSelect}
                  isSelected={isSelected(slot.startTime)}
                  onClick={() => canSelect && onTimeSelect(slot.startTime)}
                  disabled={!canSelect}
                >
                  {formatTime(slot.startTime)}
                </SlotButton>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );
};

export default TimeSlotSelector;