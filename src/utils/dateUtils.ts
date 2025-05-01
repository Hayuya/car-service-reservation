import { TimeSlot } from '../types/Reservation';
import { UnavailableTime } from '../types/UnavailableTime';
import { getUnavailableTimes } from './storageUtils';

// 営業時間の定義
export const BUSINESS_HOURS = {
  start: 9, // 9:00
  end: 18,  // 18:00
};

// 日付が同じかどうかをチェック（年月日のみ）
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 時間枠が予約不可かどうかをチェック
export const isTimeSlotUnavailable = (
  date: Date, 
  hour: number, 
  minute: number,
  unavailableTimes: UnavailableTime[]
): boolean => {
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

// スロットが予約済みかどうかを判定
export const isSlotReserved = (
  slotStart: Date, 
  slotEnd: Date, 
  reservations: any[]
): boolean => {
  return reservations.some(reservation => {
    const reservationStart = new Date(reservation.startTime);
    const reservationEnd = new Date(reservation.endTime);
    
    // 予約時間が重複するかチェック
    return (
      (slotStart >= reservationStart && slotStart < reservationEnd) ||
      (slotEnd > reservationStart && slotEnd <= reservationEnd) ||
      (slotStart <= reservationStart && slotEnd >= reservationEnd)
    );
  });
};

// 30分間隔のタイムスロットを生成
export const generateTimeSlots = (date: Date, reservations: any[] = []): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = BUSINESS_HOURS.start;
  const endHour = BUSINESS_HOURS.end;
  
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);
  
  // 予約不可能な日時を取得
  const unavailableTimes = getUnavailableTimes();
  
  // 終日予約不可能かどうかをチェック
  const isDayUnavailable = unavailableTimes.some(time => 
    time.type === 'day' && isSameDay(time.date, date)
  );
  
  // 終日予約不可能な場合は、すべてのスロットを予約不可に
  if (isDayUnavailable) {
    // 30分間隔でスロットを生成（すべて予約不可）
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const startTime = new Date(currentDate);
        startTime.setHours(hour, minutes);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        slots.push({
          startTime,
          endTime,
          isAvailable: false,
        });
      }
    }
    return slots;
  }
  
  // 30分間隔でスロットを生成
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const startTime = new Date(currentDate);
      startTime.setHours(hour, minutes);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      // 予約と重複するスロットを判定
      const isReserved = isSlotReserved(startTime, endTime, reservations);
      
      // 予約不可能な時間帯と重複するかを判定
      const isUnavailable = isTimeSlotUnavailable(date, hour, minutes, unavailableTimes);
      
      slots.push({
        startTime,
        endTime,
        isAvailable: !isReserved && !isUnavailable,
      });
    }
  }
  
  return slots;
};

// サービス時間に基づいて、選択可能な時間枠を計算
export const calculateAvailableEndTimes = (
  startTime: Date,
  duration: number,
  slots: TimeSlot[]
): boolean => {
  // 必要なスロット数 (30分単位)
  const requiredSlots = Math.ceil(duration / 30);
  
  // 開始スロットのインデックスを検索
  const startIndex = slots.findIndex(
    slot => slot.startTime.getTime() === startTime.getTime()
  );
  
  if (startIndex === -1) return false;
  
  // 必要な連続スロットがすべて空いているか確認
  for (let i = 0; i < requiredSlots; i++) {
    const slotIndex = startIndex + i;
    
    // スロットが存在し、利用可能かチェック
    if (
      slotIndex >= slots.length ||
      !slots[slotIndex].isAvailable
    ) {
      return false;
    }
  }
  
  return true;
};

// 日付のフォーマット (YYYY年MM月DD日)
export const formatDate = (date: Date): string => {
  // 無効な日付のチェック
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '日付なし';
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 時間のフォーマット (HH:MM)
export const formatTime = (date: Date): string => {
  // 無効な日付のチェック
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '時間なし';
  }
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};