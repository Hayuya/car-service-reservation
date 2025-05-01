import React from 'react';
import { Box, Paper, Typography, Grid, Button, styled } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const DayCell = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
  width: '100%',
  height: '40px',
  fontSize: '0.875rem',
  fontWeight: selected ? 'bold' : 'normal',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
  '&.disabled': {
    color: theme.palette.text.disabled,
  },
}));

const WeekdayHeader = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
  fontWeight: 'bold',
}));

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // 月の最初の日を取得
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  
  // 月の最後の日を取得
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // カレンダーの最初の日（前月の日を含む）
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(startDay.getDate() - startDay.getDay());
  
  // カレンダーの最後の日（翌月の日を含む）
  const endDay = new Date(lastDayOfMonth);
  endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
  
  // 週の配列を生成
  const weeks: Date[][] = [];
  let days: Date[] = [];
  
  const currentDate = new Date(startDay);
  
  while (currentDate <= endDay) {
    days.push(new Date(currentDate));
    
    if (days.length === 7) {
      weeks.push(days);
      days = [];
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 前月へ
  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  
  // 翌月へ
  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  // 日付を選択
  const handleDateSelect = (date: Date) => {
    onDateChange(date);
  };
  
  // 日付が現在の月かどうかを判定
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  // 日付が今日かどうかを判定
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // 日付が選択された日かどうかを判定
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // 過去の日付かどうかを判定
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  // 曜日の名前
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <CalendarHeader>
        <Button onClick={prevMonth} startIcon={<ChevronLeft />}>
          前月
        </Button>
        <Typography variant="h6">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </Typography>
        <Button onClick={nextMonth} endIcon={<ChevronRight />}>
          翌月
        </Button>
      </CalendarHeader>
      
      <Grid container>
        {weekdays.map((day, index) => (
          <Grid item xs={12 / 7} key={index}>
            <WeekdayHeader variant="subtitle2" color={index === 0 ? 'error' : index === 6 ? 'primary' : 'textPrimary'}>
              {day}
            </WeekdayHeader>
          </Grid>
        ))}
        
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => (
              <Grid item xs={12 / 7} key={`${weekIndex}-${dayIndex}`}>
                <DayCell
                  fullWidth
                  variant="text"
                  selected={isSelected(day)}
                  className={!isCurrentMonth(day) || isPastDate(day) ? 'disabled' : ''}
                  onClick={() => {
                    if (isCurrentMonth(day) && !isPastDate(day)) {
                      handleDateSelect(day);
                    }
                  }}
                  disabled={!isCurrentMonth(day) || isPastDate(day)}
                  sx={{
                    position: 'relative',
                    ...(isToday(day) && {
                      border: '1px solid',
                      borderColor: 'primary.main',
                    }),
                  }}
                >
                  {day.getDate()}
                </DayCell>
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </Paper>
  );
};

export default Calendar;