// 予約不可能な時間の型定義

// 予約不可タイプ
export type UnavailableType = 'day' | 'timeSlot';

// 予約不可能な日時の基本型
export interface UnavailableTimeBase {
  id: string;
  reason: string; // 理由（休業日、メンテナンス等）
  type: UnavailableType;
}

// 終日予約不可能
export interface UnavailableDay extends UnavailableTimeBase {
  type: 'day';
  date: Date;
}

// 特定の時間帯が予約不可能
export interface UnavailableTimeSlot extends UnavailableTimeBase {
  type: 'timeSlot';
  date: Date;
  startTime: Date;
  endTime: Date;
}

// 予約不可能な日時（終日または時間帯）
export type UnavailableTime = UnavailableDay | UnavailableTimeSlot;