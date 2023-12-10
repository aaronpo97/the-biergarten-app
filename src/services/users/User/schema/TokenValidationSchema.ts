import z from 'zod';

const TokenValidationSchema = z.object({
  token: z.string(),
});

export default TokenValidationSchema;
