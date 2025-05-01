import { Service } from '../types/Service';

export const services: Service[] = [
  {
    id: 'inspection',
    name: '車検見積もり',
    duration: 60,
  },
  {
    id: '12month-inspection',
    name: '12ヶ月点検',
    duration: 60,
  },
  {
    id: 'simple-inspection',
    name: '簡易点検',
    duration: 30,
  },
  {
    id: 'oil-change',
    name: 'オイル交換',
    duration: 30,
    options: [
      {
        id: 'oil-filter-no',
        name: 'オイルフィルター交換なし',
        duration: 30,
      },
      {
        id: 'oil-filter-yes',
        name: 'オイルフィルター交換あり',
        duration: 30,
      },
    ],
  },
  {
    id: 'tire-change',
    name: 'タイヤ交換',
    duration: 60,
    options: [
      {
        id: 'tire-registration-yes',
        name: 'タイヤ補完登録あり',
        duration: 60,
      },
      {
        id: 'tire-registration-no',
        name: 'タイヤ補完登録なし',
        duration: 60,
      },
    ],
  },
  {
    id: 'plate-estimate',
    name: '板金見積もり',
    duration: 60,
  },
];

// サービスIDからサービスを取得
export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id);
};

// サービスとオプションIDから必要時間を取得
export const getServiceDuration = (serviceId: string, optionId?: string): number => {
  const service = getServiceById(serviceId);
  
  if (!service) {
    return 0;
  }
  
  if (!optionId || !service.options) {
    return service.duration;
  }
  
  const option = service.options.find(opt => opt.id === optionId);
  return option ? option.duration : service.duration;
};

// スタッフリスト (管理画面用)
export const staffMembers = [
  { id: 'staff1', name: '田中' },
  { id: 'staff2', name: '鈴木' },
  { id: 'staff3', name: '佐藤' },
  { id: 'staff4', name: '高橋' },
];