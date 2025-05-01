// src/components/ServiceDetails.tsx
import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { Service, ServiceOption } from '../types/Service';
import { services } from '../data/serviceMenu';

interface ServiceDetailsProps {
  selectedService: {
    serviceId: string;
    optionId?: string;
  } | null;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ selectedService }) => {
  if (!selectedService?.serviceId) {
    return null;
  }

  // 選択されたサービスの情報を取得
  const service = services.find(s => s.id === selectedService.serviceId);
  if (!service) {
    return null;
  }

  // オプションがある場合はオプション情報も取得
  let option: ServiceOption | undefined;
  if (selectedService.optionId && service.options) {
    option = service.options.find(o => o.id === selectedService.optionId);
  }

  // 表示する画像と説明文を決定
  const imageUrl = option?.imageUrl || service.imageUrl || '/images/services/default.jpg';
  const description = option?.description || service.description || 'このサービスの詳細は準備中です。';

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        選択中のサービス: {service.name}
        {option && ` (${option.name})`}
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Box 
            component="img"
            src={imageUrl}
            alt={`${service.name}のイメージ`}
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="body1" paragraph>
            {description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            所要時間: {option?.duration || service.duration}分
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServiceDetails;