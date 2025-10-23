import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

const TelemetryModal = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '12px',
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Интеграция системы мониторинга транспорта с Агро-Коннект
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Тариф: Интеграция
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
                <Typography variant="body1" sx={{ mb: 3, color: '#333' }}>
                    В этом разделе вы можете отслеживать сельхозтехнику в реальном времени
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    Краткая информация по основным функциям:
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        mb: 2,
                        borderLeft: '4px solid #4caf50'
                    }}>
                        <Typography variant="body1" sx={{ color: '#333' }}>
                            Получать и анализировать данные из внешней системы мониторинга транспорта
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '8px',
                        borderLeft: '4px solid #4caf50'
                    }}>
                        <Typography variant="body1" sx={{ color: '#333' }}>
                            Контроль и качество выполнения работ, например, посев и обработку полей
                        </Typography>
                    </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, color: '#666', fontStyle: 'italic' }}>
                    Этот раздел дорабатывается и будем рады обратной связи!
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    sof-it.tech@yandex.ru
                </Typography>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        borderColor: '#ddd',
                        '&:hover': {
                            backgroundColor: '#e0e0e0',
                            borderColor: '#bbb',
                        }
                    }}
                >
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const SatelliteModal = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '12px',
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Интеграция с технологией космического мониторинга с Агро-Коннект
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Тариф: Интеграция
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
                <Typography variant="body1" sx={{ mb: 3, color: '#333' }}>
                    Технологии космического мониторинга позволяют эффективно отслеживать различные аспекты сельскохозяйственной деятельности.
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    Краткая информация по основным функциям:
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        mb: 2,
                        borderLeft: '4px solid #4caf50'
                    }}>
                        <Typography variant="body1" sx={{ color: '#333' }}>
                            Наблюдать за ростом растений, наступлением фенофаз, осадками и температурой
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '8px',
                        borderLeft: '4px solid #4caf50'
                    }}>
                        <Typography variant="body1" sx={{ color: '#333' }}>
                            Выполнение оперативного контроля состояния посевов на различных стадиях
                        </Typography>
                    </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, color: '#666', fontStyle: 'italic' }}>
                    Этот раздел дорабатывается и будем рады обратной связи!
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    sof-it.tech@yandex.ru
                </Typography>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        borderColor: '#ddd',
                        '&:hover': {
                            backgroundColor: '#e0e0e0',
                            borderColor: '#bbb',
                        }
                    }}
                >
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export { TelemetryModal, SatelliteModal };
