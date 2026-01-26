import { z } from 'zod';

const UpdateProfileSchema = z.object({
  bio: z.string(),
  userAvatar: z
    .instanceof(typeof FileList !== 'undefined' ? FileList : Object)
    .refine((fileList) => fileList instanceof FileList, {
      message: 'You must submit this form in a web browser.',
    })
    .refine((fileList) => [...(fileList as FileList)].length <= 1, {
      message: 'You must upload only one or zero files.',
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

export default UpdateProfileSchema;
