import { useForm as useReactHookForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type UseFormProps<T extends FieldValues> = {
  defaultValues: T;
  validationSchema: yup.SchemaOf<T>;
  onSubmit: SubmitHandler<T>;
};

export const useForm = <T extends FieldValues>({ defaultValues, validationSchema, onSubmit }: UseFormProps<T>) => {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useReactHookForm<T>({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  return {
    control,
    errors,
    register,
    watch,
    getValues,
    setValue,
    onSubmit: handleSubmit(onSubmit),
  };
};
