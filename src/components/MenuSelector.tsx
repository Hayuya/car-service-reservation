import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import { Service, ServiceOption, SelectedService } from '../types/Service';

interface MenuSelectorProps {
  services: Service[];
  selectedService: SelectedService | null;
  onServiceSelect: (service: SelectedService) => void;
}

const MenuSelector: React.FC<MenuSelectorProps> = ({
  services,
  selectedService,
  onServiceSelect,
}) => {
  // サービスを選択
  const handleServiceSelect = (serviceId: string) => {
    console.log('サービス選択:', serviceId);
    
    // 選択中のサービスと同じなら選択解除
    if (selectedService?.serviceId === serviceId) {
      onServiceSelect({ serviceId: '' });
      return;
    }
    
    const service = services.find(s => s.id === serviceId);
    
    // オプションがない場合はサービスのみ選択
    if (!service?.options || service.options.length === 0) {
      onServiceSelect({ serviceId });
      return;
    }
    
    // オプションがある場合は最初のオプションを自動選択
    onServiceSelect({
      serviceId,
      optionId: service.options[0].id,
    });
  };
  
  // オプションを選択
  const handleOptionSelect = (optionId: string) => {
    console.log('オプション選択:', optionId);
    
    if (!selectedService) return;
    
    onServiceSelect({
      ...selectedService,
      optionId,
    });
  };
  
  // 選択中のサービスを取得
  const selectedServiceData = services.find(s => s.id === selectedService?.serviceId);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        サービスを選択
      </Typography>
      
      <List sx={{ bgcolor: 'background.paper' }}>
        {services.map((service, index) => (
          <React.Fragment key={service.id}>
            <ListItem disablePadding>
              <ListItemButton 
                selected={selectedService?.serviceId === service.id}
                onClick={() => handleServiceSelect(service.id)}
                sx={{ 
                  borderLeft: selectedService?.serviceId === service.id ? 4 : 0, 
                  borderColor: 'primary.main',
                  pl: selectedService?.serviceId === service.id ? 1 : 2
                }}
              >
                <Radio
                  checked={selectedService?.serviceId === service.id}
                  onChange={() => handleServiceSelect(service.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <ListItemText 
                  primary={service.name} 
                  secondary={`所要時間: ${service.duration}分`} 
                />
              </ListItemButton>
            </ListItem>
            {index < services.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      
      {/* 選択されたサービスにオプションがある場合 */}
      {selectedServiceData?.options && selectedServiceData.options.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            オプションを選択
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedService?.optionId || ''}
              onChange={(e) => handleOptionSelect(e.target.value)}
            >
              {selectedServiceData.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={`${option.name} (所要時間: ${option.duration}分)`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      )}
    </Paper>
  );
};

export default MenuSelector;