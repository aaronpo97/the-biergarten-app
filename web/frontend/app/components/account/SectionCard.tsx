import type { ReactNode } from 'react';

interface SectionCardProps {
   icon: ReactNode;
   title: string;
   description: string;
   open: boolean;
   onToggle: () => void;
   children: ReactNode;
}

const SectionCard = ({
   icon,
   title,
   description,
   open,
   onToggle,
   children,
}: SectionCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body">
            <div className="flex w-full items-center justify-between gap-5">
                <div className="flex items-start gap-3">
                    <span className="text-base-content/60 mt-1">{icon}</span>
                    <div>
                        <h2 className="card-title text-lg">{title}</h2>
                        <p className="text-sm text-base-content/70">{description}</p>
                    </div>
                </div>
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={open}
                    onChange={onToggle}
                    aria-label={`Toggle ${title.toLowerCase()} form`}
                />
            </div>
            {open && <div className="mt-4">{children}</div>}
        </div>
    </div>
);


export default SectionCard;