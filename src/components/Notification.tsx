
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationProps {
  message: string | null;
  type?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
  onComplete?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'default',
  duration = 3000,
  onComplete
}) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (message) {
      const variantMap: Record<string, any> = {
        'default': {},
        'success': { variant: 'default', className: 'bg-green-500 text-white border-green-600' },
        'error': { variant: 'destructive' },
        'warning': { variant: 'default', className: 'bg-yellow-500 text-white border-yellow-600' },
      };
      
      toast({
        title: message,
        ...variantMap[type],
        duration: duration,
      });
      
      if (onComplete) {
        const timer = setTimeout(() => {
          onComplete();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, type, duration, onComplete, toast]);
  
  return null;
};

export default Notification;
