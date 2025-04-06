
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { tutorials } from '@/data/simulationData';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  totalSteps: number;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ 
  isOpen, 
  onClose, 
  step, 
  onNextStep, 
  onPrevStep,
  totalSteps
}) => {
  const currentTutorial = tutorials[step - 1];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tutorial Step {step}: {currentTutorial?.title}</DialogTitle>
          <DialogDescription>
            {currentTutorial?.content}
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-40 mt-2 bg-secondary rounded-md flex items-center justify-center">
          <div className="text-center">
            <img 
              src={`/placeholder.svg`} 
              alt={`Tutorial step ${step}`} 
              className="mx-auto h-24 w-24 opacity-40" 
            />
            <p className="text-sm text-muted-foreground mt-2">Tutorial illustration for step {step}</p>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={onPrevStep}>
                Previous
              </Button>
            )}
          </div>
          <div>
            {step < totalSteps ? (
              <Button onClick={onNextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={onClose}>
                Get Started
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialOverlay;
