import { ReactNode, FC } from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { BiArrowBack } from 'react-icons/bi';

interface FormPageLayoutProps {
  children: ReactNode;
  headingText: string;
  headingIcon: IconType;
  backLink: string;
  backLinkText: string;
}

const FormPageLayout: FC<FormPageLayoutProps> = ({
  children: FormComponent,
  headingIcon,
  headingText,
  backLink,
  backLinkText,
}) => {
  return (
    <div className="align-center my-20 flex h-fit flex-col items-center justify-center">
      <div className="w-8/12">
        <div className="tooltip tooltip-bottom absolute" data-tip={backLinkText}>
          <Link href={backLink} className="btn-ghost btn-sm btn p-0">
            <BiArrowBack className="text-xl" />
          </Link>
        </div>
        <div className="flex flex-col items-center space-y-1">
          {headingIcon({ className: 'text-4xl' })}{' '}
          <h1 className="text-3xl font-bold">{headingText}</h1>
        </div>
        <div>{FormComponent}</div>
      </div>
    </div>
  );
};

export default FormPageLayout;
