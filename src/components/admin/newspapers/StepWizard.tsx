import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { CreateWizardStep } from '@/types/admin';

const STEPS: { id: CreateWizardStep; label: string }[] = [
  { id: 'date', label: 'Date' },
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review' },
];

interface StepWizardProps {
  currentStep: CreateWizardStep;
}

export function StepWizard({ currentStep }: StepWizardProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Create newspaper steps" className="mb-8">
      <ol className="flex items-center gap-2 md:gap-4">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-2 md:gap-4 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium border-2 transition-colors',
                    isComplete && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary bg-primary/10',
                    !isComplete && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium truncate hidden sm:block',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 min-w-[16px] rounded',
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
