import { Button } from '@headlessui/react';

interface SubmitButtonProps {
   isSubmitting: boolean;
   idleText: string;
   submittingText: string;
   className?: string;
}

export default function SubmitButton({
   isSubmitting,
   idleText,
   submittingText,
   className,
}: SubmitButtonProps) {
   return (
      <Button
         type="submit"
         disabled={isSubmitting}
         className={className ?? 'btn btn-primary w-full mt-2'}
      >
         {isSubmitting ? (
            <>
               <span className="loading loading-spinner loading-sm" /> {submittingText}
            </>
         ) : (
            idleText
         )}
      </Button>
   );
}
