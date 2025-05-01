import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import MenuSelector from '../components/MenuSelector';
import Calendar from '../components/Calendar';
import TimeSlotSelector from '../components/TimeSlotSelector';
import ServiceDetails from '../components/ServiceDetails';
import { services, getServiceDuration } from '../data/serviceMenu';
import { generateTimeSlots, formatDate, formatTime } from '../utils/dateUtils';
import { Customer, Reservation, TimeSlot } from '../types/Reservation';
import { SelectedService } from '../types/Service';
import { getReservations, addReservation, initializeWithSampleData } from '../utils/storageUtils';

// ステップの定義
const steps = ['サービス選択', '日付選択', '時間選択', '顧客情報入力'];

const ReservationForm: React.FC = () => {
  // ステップ管理
  const [activeStep, setActiveStep] = useState(0);
  
  // サービス選択の状態
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null);
  
  // 日付選択の状態
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // 時間枠の状態
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // 選択された時間
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  
  // 顧客情報の状態
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    phone: '',
    notes: '',
  });
  
  // 完了メッセージの状態
  const [success, setSuccess] = useState(false);
  
  // 既存の予約データ
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);
  
  // サンプルデータの初期化（初回のみ）
  useEffect(() => {
    initializeWithSampleData();
  }, []);
  
  // 既存の予約を読み込み
  useEffect(() => {
    const reservations = getReservations();
    setExistingReservations(reservations);
  }, []);
  
  // サービス時間の計算
  const getSelectedServiceDuration = (): number => {
    if (!selectedService?.serviceId) return 0;
    return getServiceDuration(selectedService.serviceId, selectedService.optionId);
  };
  
  // 時間枠を更新
  useEffect(() => {
    const slots = generateTimeSlots(selectedDate, existingReservations);
    setTimeSlots(slots);
    setSelectedTime(null); // 日付が変わったら時間選択をリセット
  }, [selectedDate, existingReservations]);
  
  // ステップの検証
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // サービス選択
        return !!selectedService?.serviceId && selectedService.serviceId !== '';
      case 1: // 日付選択
        return !!selectedDate;
      case 2: // 時間選択
        return !!selectedTime;
      case 3: // 顧客情報
        return !!customer.name && !!customer.phone;
      default:
        return false;
    }
  };
  
  // サービス選択の状態をデバッグ出力
  useEffect(() => {
    console.log('選択されたサービス:', selectedService);
    console.log('ステップ有効:', isStepValid(activeStep));
  }, [selectedService, activeStep]);
  
  // 次のステップへ
  const handleNext = () => {
    console.log('次へボタン押下:', {
      activeStep,
      isValid: isStepValid(activeStep),
      selectedService
    });
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
      return;
    }
    
    if (isStepValid(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      console.warn('現在のステップは有効ではありません:', activeStep);
    }
  };
  
  // 前のステップへ
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // 顧客情報の入力
  const handleCustomerChange = (field: keyof Customer, value: string) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // 予約を送信
  const handleSubmit = () => {
    if (!selectedService?.serviceId || !selectedTime) return;
    
    const duration = getSelectedServiceDuration();
    
    // 終了時間を計算
    const endTime = new Date(selectedTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    // 顧客情報から備考欄の値が確実に含まれるようにする
    const customerData: Customer = {
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes || '',  // undefinedの場合は空文字を設定
    };
    
    // 予約データを作成
    const reservation: Reservation = {
      id: uuidv4(),
      customer: customerData,
      service: selectedService,
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      status: 'confirmed',
    };
    
    // デバッグ出力
    console.log('作成した予約データ:', {
      id: reservation.id,
      customerName: reservation.customer.name,
      customerPhone: reservation.customer.phone,
      customerNotes: reservation.customer.notes,  // 備考欄の値を確認
    });
    
    // ローカルストレージに保存
    addReservation(reservation);
    
    // 予約リストを更新
    setExistingReservations([...existingReservations, reservation]);
    
    // 成功メッセージを表示
    setSuccess(true);
    
    // フォームをリセット
    setTimeout(() => {
      setActiveStep(0);
      setSelectedService(null);
      setSelectedDate(new Date());
      setSelectedTime(null);
      setCustomer({
        name: '',
        phone: '',
        notes: '',
      });
      setSuccess(false);
    }, 3000);
  };
  
  // ステップコンテンツのレンダリング
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // サービス選択
        return (
          <MenuSelector
            services={services}
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
          />
        );
      case 1: // 日付選択
        return (
          <>
            <Calendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            {/* 選択したサービスの詳細を表示 */}
            <ServiceDetails selectedService={selectedService} />
          </>
        );
      case 2: // 時間選択
        return (
          <>
            <TimeSlotSelector
              slots={timeSlots}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              serviceDuration={getSelectedServiceDuration()}
            />
            {/* 選択したサービスの詳細を表示 */}
            <ServiceDetails selectedService={selectedService} />
          </>
        );
      case 3: // 顧客情報入力
        return (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              お客様情報
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="お名前"
                  value={customer.name}
                  onChange={(e) => handleCustomerChange('name', e.target.value)}
                  error={activeStep === 3 && !customer.name}
                  helperText={activeStep === 3 && !customer.name ? 'お名前を入力してください' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="電話番号"
                  value={customer.phone}
                  onChange={(e) => handleCustomerChange('phone', e.target.value)}
                  error={activeStep === 3 && !customer.phone}
                  helperText={activeStep === 3 && !customer.phone ? '電話番号を入力してください' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="備考"
                  value={customer.notes}
                  onChange={(e) => handleCustomerChange('notes', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        );
      default:
        return null;
    }
  };
  
  // 予約内容の概要
  const renderSummary = () => {
    if (activeStep !== 3) return null;
    
    const serviceName = services.find(s => s.id === selectedService?.serviceId)?.name || '';
    const optionName = selectedService?.optionId
      ? services
          .find(s => s.id === selectedService.serviceId)
          ?.options?.find(o => o.id === selectedService.optionId)?.name || ''
      : '';
    
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          予約内容の確認
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">サービス</Typography>
            <Typography variant="body1" gutterBottom>
              {serviceName}
              {optionName && ` (${optionName})`}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">所要時間</Typography>
            <Typography variant="body1" gutterBottom>
              {getSelectedServiceDuration()}分
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">日付</Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(selectedDate)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">時間</Typography>
            <Typography variant="body1" gutterBottom>
              {selectedTime ? formatTime(selectedTime) : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          サービス予約
        </Typography>
        
        {/* ステッパー */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* 予約完了メッセージ */}
        <Snackbar
          open={success}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            予約が完了しました！
          </Alert>
        </Snackbar>
        
        {/* 予約内容の概要（最後のステップのみ表示） */}
        {renderSummary()}
        
        {/* 各ステップのコンテンツ */}
        {renderStepContent()}
        
        {/* ナビゲーションボタン */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            戻る
          </Button>
          <Button
            variant="contained"
            disabled={!isStepValid(activeStep)}
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? '予約する' : '次へ'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReservationForm;