import { ReactNode, FC } from 'react';
import { IconType } from 'react-icons';

interface FormPageLayoutProps {
  children: ReactNode;
  headingText: string;
  headingIcon: IconType;
}

const FormPageLayout: FC<FormPageLayoutProps> = ({
  children: FormComponent,
  headingIcon,
  headingText,
}) => {
  return (
    <div className="align-center my-20 flex h-fit flex-col items-center justify-center">
      <div className="w-8/12">
        <div className="my-4 flex flex-col items-center space-y-1">
          {headingIcon({ className: 'text-4xl' })}
          <h1 className="text-3xl font-bold">{headingText}</h1>
        </div>
        <div>{FormComponent}</div>
      </div>
    </div>
  );
};

export default FormPageLayout;
