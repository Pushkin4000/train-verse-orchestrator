
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { conceptInfo } from '@/data/simulationData';

interface ConceptInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept: keyof typeof conceptInfo | null;
}

const ConceptInfoModal: React.FC<ConceptInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  concept 
}) => {
  if (!concept) return null;
  
  const info = conceptInfo[concept];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{info.title}</DialogTitle>
          <DialogDescription>
            {info.description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ConceptInfoModal;
