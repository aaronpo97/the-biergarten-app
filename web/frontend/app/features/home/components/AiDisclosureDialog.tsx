import { Sparks } from 'iconoir-react';
import { useEffect, useState } from 'react';

const ethicsDocUrl =
    'https://github.com/aaronpo97/the-biergarten-app/blob/main/docs/pipeline/ETHICS-AND-KNOWN-ISSUES.md';

const AiDisclosureDialog = ({ defaultOpen = true }: { defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="modal modal-open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-disclosure-title"
        >
            <div className="modal-box max-w-md">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="text-primary">
                        <Sparks className="size-10" aria-hidden="true" />
                    </span>
                    <h2 id="ai-disclosure-title" className="text-lg font-bold">
                        This content is AI-generated
                    </h2>
                    <p className="text-sm text-base-content/70">
                        The Biergarten App is a proof of concept. Every brewery, beer, and user in
                        this catalogue is fixture data produced by a language model — none of it
                        describes a real business, person, or beer.
                    </p>
                    <div role="alert" className="alert alert-warning alert-soft text-left">
                        <span className="text-sm">
                            Brewing details, local-language text, and coordinates are known to
                            contain fabrications. Treat nothing here as factual.
                        </span>
                    </div>
                    <a
                        href={ethicsDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary text-sm"
                    >
                        How this data was generated
                    </a>
                </div>
                <div className="modal-action">
                    <button
                        type="button"
                        className="btn btn-primary w-full"
                        autoFocus
                        onClick={() => setOpen(false)}
                    >
                        I understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiDisclosureDialog;
