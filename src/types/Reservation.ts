// 予約情報の型定義
import { SelectedService } from './Service';

// 顧客情報
export interface Customer {
  name: string;
  phone: string;
  notes?: string;
}

// 時間枠（30分単位）
export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

// 予約データ
export interface Reservation {
  id: string;
  customer: Customer;
  service: SelectedService;
  date: Date;
  startTime: Date;
  endTime: Date;
  assignedStaff?: string; // 担当者
  notes?: string; // 管理者メモ
  status: 'confirmed' | 'canceled' | 'completed';
}