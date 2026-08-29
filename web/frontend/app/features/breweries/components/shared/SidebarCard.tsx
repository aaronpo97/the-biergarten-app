import type { ReactNode } from 'react';

interface SidebarCardProps {
    title: string;
    children: ReactNode;
}

const SidebarCard = ({ title, children }: SidebarCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body gap-3 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/50 m-0">
                {title}
            </p>
            {children}
        </div>
    </div>
);

export default SidebarCard;
