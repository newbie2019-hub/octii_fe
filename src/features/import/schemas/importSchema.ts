import { z } from 'zod';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const ACCEPTED_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
  'application/x-sqlite3',
  '', // Some systems don't set a MIME type for .apkg files
];

export const ImportFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: 'File cannot be empty',
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'File size must not exceed 200MB',
    })
    .refine((file) => file.name.endsWith('.apkg'), {
      message: 'File must be an .apkg file',
    }),
});

export type ImportFileValues = z.infer<typeof ImportFileSchema>;

