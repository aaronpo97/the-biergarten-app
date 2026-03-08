import { z } from 'zod';

const UploadImageValidationSchema = z.object({
  images: z
    .instanceof(typeof FileList !== 'undefined' ? FileList : Object)
    .refine((fileList) => fileList instanceof FileList, {
      message: 'You must submit this form in a web browser.',
    })
    .refine((fileList) => (fileList as FileList).length > 0, {
      message: 'You must upload at least one file.',
    })
    .refine((fileList) => (fileList as FileList).length < 5, {
      message: 'You can only upload up to 5 files at a time.',
    })
    .refine(
      (fileList) =>
        [...(fileList as FileList)]
          .map((file) => file.type)
          .every((fileType) => fileType.startsWith('image/')),
      { message: 'You must upload only images.' },
    )
    .refine(
      (fileList) =>
        [...(fileList as FileList)]
          .map((file) => file.size)
          .every((fileSize) => fileSize < 15 * 1024 * 1024),
      { message: 'You must upload images smaller than 15MB.' },
    ),
});

export default UploadImageValidationSchema;
