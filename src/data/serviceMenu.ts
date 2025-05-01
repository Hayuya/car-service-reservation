import { Service } from '../types/Service';

export const services: Service[] = [
  {
    id: 'inspection',
    name: '車検見積もり',
    duration: 60,
    imageUrl: 'default.png',
    description: '車検に必要な点検項目を確認し、必要な整備内容と費用の見積もりを作成します。車の状態を詳しく診断し、安全面や法規制の遵守状況を確認します。',
  },
  {
    id: '12month-inspection',
    name: '12ヶ月点検',
    duration: 60,
    imageUrl: 'default.png',
    description: '1年ごとの定期点検で、ブレーキやライト、タイヤなど24項目の安全確認を実施。車の状態を細かくチェックし、将来的な故障を未然に防ぎます。',
  },
  {
    id: 'simple-inspection',
    name: '簡易点検',
    duration: 30,
    imageUrl: 'default.png',
    description: '基本的な安全項目を短時間でチェック。タイヤ、ブレーキ、ライト、オイルなど主要部品の状態を確認し、安全性を素早く診断します。',
  },
  {
    id: 'oil-change',
    name: 'オイル交換',
    duration: 30,
    imageUrl: 'default.png',
    description: 'エンジンオイルの交換作業です。エンジンの寿命を延ばし、性能を維持するために定期的な交換が推奨されます。',
    options: [
      {
        id: 'oil-filter-no',
        name: 'オイルフィルター交換なし',
        duration: 30,
        imageUrl: 'default.png',
        description: 'エンジンオイルのみを交換します。オイルフィルターは交換せず、再利用します。',
      },
      {
        id: 'oil-filter-yes',
        name: 'オイルフィルター交換あり',
        duration: 30,
        imageUrl: 'default.png',
        description: 'エンジンオイルとオイルフィルターを同時に交換します。エンジンの清浄度を保つのに最適です。',
      },
    ],
  },
  {
    id: 'tire-change',
    name: 'タイヤ交換',
    duration: 60,
    imageUrl: 'default.png',
    description: 'タイヤの交換作業を行います。季節に応じたタイヤ交換や摩耗したタイヤの新品への交換など、安全な走行をサポートします。',
    options: [
      {
        id: 'tire-registration-yes',
        name: 'タイヤ補完登録あり',
        duration: 60,
        imageUrl: 'default.png',
        description: 'タイヤ交換と共に、タイヤ情報の車両データへの登録作業も行います。車両管理システムへの正確な情報登録に対応します。',
      },
      {
        id: 'tire-registration-no',
        name: 'タイヤ補完登録なし',
        duration: 60,
        imageUrl: 'default.png',
        description: 'タイヤ交換のみを行います。システム登録は行わず、純粋な交換作業のみを実施します。',
      },
    ],
  },
  {
    id: 'plate-estimate',
    name: '板金見積もり',
    duration: 60,
    imageUrl: 'default.png',
    description: '車体の損傷箇所を確認し、板金修理に必要な作業内容と費用の見積もりを作成します。傷や凹みの程度を詳細に診断します。',
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