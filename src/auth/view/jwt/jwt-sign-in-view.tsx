import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { signInWithPassword } from '../../context/jwt';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  userName: zod
    .string()
    .min(1, { message: 'Tên đăng nhập không được để trống!' }),
  password: zod
    .string()
    .min(1, { message: 'Mật khẩu không được để trống!' })
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignInSchemaType = {
    userName: 'developer',
    password: 'Admin123@',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({ userName: data.userName, password: data.password });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="userName" label="Tên đăng nhập" slotProps={{ inputLabel: { shrink: true } }} />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Field.Text
          name="password"
          label="Mật khẩu"
          placeholder="6+ ký tự"
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Button
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Đang đăng nhập..."
      >
        Đăng nhập
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Đăng nhập hệ thống"
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
