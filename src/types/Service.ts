// サービスとオプションの型定義
export interface ServiceOption {
    id: string;
    name: string;
    duration: number; // 分単位
  }
  
  export interface Service {
    id: string;
    name: string;
    duration: number; // 分単位
    options?: ServiceOption[];
  }
  
  // 選択されたサービスの型
  export interface SelectedService {
    serviceId: string;
    optionId?: string;
  }