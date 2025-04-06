import { ZodType } from 'zod'

export const parseResponseSafe = async <T>(
  data: unknown,
  schema: ZodType<unknown>,
): Promise<T | undefined> => {
  try {
    return (await schema.parseAsync(data)) as T
  } catch (validationError) {
    console.error('Schema validation error:', { validationError })
    return undefined
  }
}
