// src/types/Service.ts
export interface ServiceOption {
    id: string;
    name: string;
    duration: number; // 分単位
    imageUrl?: string; // 画像URL
    description?: string; // 詳細説明
  }
  
  export interface Service {
    id: string;
    name: string;
    duration: number; // 分単位
    imageUrl?: string; // 画像URL
    description?: string; // 詳細説明
    options?: ServiceOption[];
  }
  
  // 選択されたサービスの型
  export interface SelectedService {
    serviceId: string;
    optionId?: string;
  }