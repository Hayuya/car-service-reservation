import { Reservation } from '../types/Reservation';
import { UnavailableTime } from '../types/UnavailableTime';

// ローカルストレージのキー
const STORAGE_KEY = 'car_service_reservations';
const UNAVAILABLE_TIMES_KEY = 'car_service_unavailable_times';

// 予約データをローカルストレージから取得
export const getReservations = (): Reservation[] => {
  return getDataFromStorage(STORAGE_KEY);
};

// 予約データをローカルストレージに保存
export const saveReservations = (reservations: Reservation[]): void => {
  saveDataToStorage(STORAGE_KEY, reservations);
};

// 予約不可能な日時をローカルストレージから取得
export const getUnavailableTimes = (): UnavailableTime[] => {
  return getDataFromStorage(UNAVAILABLE_TIMES_KEY);
};

// 予約不可能な日時をローカルストレージに保存
export const saveUnavailableTimes = (unavailableTimes: UnavailableTime[]): void => {
  saveDataToStorage(UNAVAILABLE_TIMES_KEY, unavailableTimes);
};

// ローカルストレージからデータを取得する汎用関数
const getDataFromStorage = <T>(key: string): T[] => {
  const storedData = localStorage.getItem(key);
  
  if (!storedData) {
    return [];
  }
  
  try {
    // JSONデータを解析し、Date型を復元
    const data = JSON.parse(storedData, (key, value) => {
      // 日付文字列をDate型に変換
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      if (typeof value === 'string' && datePattern.test(value)) {
        return new Date(value);
      }
      return value;
    });
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`${key}の読み込みに失敗しました:`, error);
    return [];
  }
};

// ローカルストレージにデータを保存する汎用関数
const saveDataToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`${key}の保存に失敗しました:`, error);
  }
};

// 新しい予約を追加
export const addReservation = (reservation: Reservation): void => {
  const reservations = getReservations();
  reservations.push(reservation);
  saveReservations(reservations);
};

// 予約を更新
export const updateReservation = (updatedReservation: Reservation): boolean => {
  const reservations = getReservations();
  const index = reservations.findIndex(r => r.id === updatedReservation.id);
  
  if (index === -1) {
    return false;
  }
  
  reservations[index] = updatedReservation;
  saveReservations(reservations);
  return true;
};

// 予約を削除
export const deleteReservation = (id: string): boolean => {
  const reservations = getReservations();
  const initialLength = reservations.length;
  
  const filteredReservations = reservations.filter(r => r.id !== id);
  
  if (filteredReservations.length === initialLength) {
    return false;
  }
  
  saveReservations(filteredReservations);
  return true;
};

// 予約不可能な日時を追加
export const addUnavailableTime = (unavailableTime: UnavailableTime): void => {
  const unavailableTimes = getUnavailableTimes();
  unavailableTimes.push(unavailableTime);
  saveUnavailableTimes(unavailableTimes);
};

// 予約不可能な日時を更新
export const updateUnavailableTime = (updatedTime: UnavailableTime): boolean => {
  const unavailableTimes = getUnavailableTimes();
  const index = unavailableTimes.findIndex(t => t.id === updatedTime.id);
  
  if (index === -1) {
    return false;
  }
  
  unavailableTimes[index] = updatedTime;
  saveUnavailableTimes(unavailableTimes);
  return true;
};

// 予約不可能な日時を削除
export const deleteUnavailableTime = (id: string): boolean => {
  const unavailableTimes = getUnavailableTimes();
  const initialLength = unavailableTimes.length;
  
  const filteredTimes = unavailableTimes.filter(t => t.id !== id);
  
  if (filteredTimes.length === initialLength) {
    return false;
  }
  
  saveUnavailableTimes(filteredTimes);
  return true;
};

// 指定日時が予約可能かチェック
export const isTimeAvailable = (date: Date, startTime: Date, endTime: Date): boolean => {
  const unavailableTimes = getUnavailableTimes();
  
  // 日時が同じかどうかを判定（年月日のみ）
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // 時間帯が重複するかを判定
  const isTimeOverlap = (
    start1: Date, end1: Date,
    start2: Date, end2: Date
  ): boolean => {
    return (
      (start1 >= start2 && start1 < end2) ||
      (end1 > start2 && end1 <= end2) ||
      (start1 <= start2 && end1 >= end2)
    );
  };
  
  // 予約不可能な日時と重複するかチェック
  for (const unavailableTime of unavailableTimes) {
    // 終日予約不可能な場合
    if (unavailableTime.type === 'day' && isSameDay(date, unavailableTime.date)) {
      return false;
    }
    
    // 特定の時間帯が予約不可能な場合
    if (
      unavailableTime.type === 'timeSlot' &&
      isSameDay(date, unavailableTime.date) &&
      isTimeOverlap(startTime, endTime, unavailableTime.startTime, unavailableTime.endTime)
    ) {
      return false;
    }
  }
  
  return true;
};

// サンプルデータの初期化（初回のみ）
export const initializeWithSampleData = (): void => {
  // すでに予約データがある場合は初期化しない
  if (localStorage.getItem(STORAGE_KEY)) {
    return;
  }
  
  // サンプル予約データ
  const sampleReservations: Reservation[] = [
    {
      id: '1',
      customer: { name: '山田太郎', phone: '090-1234-5678', notes: '初回来店' },
      service: { serviceId: 'oil-change', optionId: 'oil-filter-yes' },
      date: new Date(),
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      endTime: new Date(new Date().setHours(10, 30, 0, 0)),
      assignedStaff: 'staff1',
      notes: '',
      status: 'confirmed',
    },
    {
      id: '2',
      customer: { name: '佐藤花子', phone: '080-8765-4321', notes: 'リピーター' },
      service: { serviceId: 'inspection', optionId: undefined },
      date: new Date(),
      startTime: new Date(new Date().setHours(14, 0, 0, 0)),
      endTime: new Date(new Date().setHours(15, 0, 0, 0)),
      assignedStaff: 'staff2',
      notes: '事前連絡済み',
      status: 'confirmed',
    },
    {
      id: '3',
      customer: { name: '鈴木一郎', phone: '070-2345-6789' },
      service: { serviceId: 'tire-change', optionId: 'tire-registration-yes' },
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: new Date(new Date().setHours(11, 0, 0, 0)),
      endTime: new Date(new Date().setHours(12, 0, 0, 0)),
      notes: 'タイヤ持ち込み',
      status: 'confirmed',
    },
  ];
  
  saveReservations(sampleReservations);
  
  // サンプル予約不可能日時データ
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const sampleUnavailableTimes: UnavailableTime[] = [
    {
      id: '1',
      type: 'day',
      date: nextWeek,
      reason: '店舗休業日',
    },
    {
      id: '2',
      type: 'timeSlot',
      date: tomorrow,
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(12, 0, 0, 0)),
      reason: 'スタッフミーティング',
    },
  ];
  
  saveUnavailableTimes(sampleUnavailableTimes);
};