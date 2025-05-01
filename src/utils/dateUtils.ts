import { TimeSlot } from '../types/Reservation';

// 営業時間の定義
export const BUSINESS_HOURS = {
  start: 9, // 9:00
  end: 18,  // 18:00
};

// 30分間隔のタイムスロットを生成
export const generateTimeSlots = (date: Date, reservations: any[] = []): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = BUSINESS_HOURS.start;
  const endHour = BUSINESS_HOURS.end;
  
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);
  
  // 30分間隔でスロットを生成
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const startTime = new Date(currentDate);
      startTime.setHours(hour, minutes);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      // 予約と重複するスロットを判定
      const isAvailable = !isSlotReserved(startTime, endTime, reservations);
      
      slots.push({
        startTime,
        endTime,
        isAvailable
      });
    }
  }
  
  return slots;
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