import { useState } from 'react';

import { useForm } from 'react-hook-form';

import {
    Alert,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import axiosInstance, { endpoints } from 'src/lib/axios';

interface ChangePasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function SecuritySettingsForm() {
    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordForm>({
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const newPassword = watch('newPassword');

    const onSubmit = async (data: ChangePasswordForm) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (data.newPassword.length < 6 || data.newPassword.length > 32) {
            toast.error('Mật khẩu phải từ 6 đến 32 ký tự');
            return;
        }

        try {
            const response = await axiosInstance.patch(endpoints.auth.changeMyPassword, {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });

            if (response.data) {
                toast.success('Đổi mật khẩu thành công');
                reset();
            }
        } catch (error: any) {
            const errorMessage = error.message || error.response?.data?.message || 'Đổi mật khẩu thất bại';
            toast.error(errorMessage);
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPassword) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                <Alert severity="info">
                    Mật khẩu phải chứa ít nhất 6 ký tự và tối đa 32 ký tự
                </Alert>

                <TextField
                    fullWidth
                    variant="standard"
                    label="Mật khẩu hiện tại"
                    type={showPassword.oldPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu hiện tại"
                    {...register('oldPassword', { required: 'Vui lòng nhập mật khẩu hiện tại' })}
                    error={!!errors.oldPassword}
                    helperText={errors.oldPassword?.message?.toString() ?? ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => togglePasswordVisibility('oldPassword')}
                                    edge="end"
                                >
                                    <Iconify
                                        icon={showPassword.oldPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    variant="standard"
                    label="Mật khẩu mới"
                    type={showPassword.newPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    {...register('newPassword', {
                        required: 'Vui lòng nhập mật khẩu mới',
                        minLength: { value: 6, message: 'Mật khẩu phải ít nhất 6 ký tự' },
                        maxLength: { value: 32, message: 'Mật khẩu tối đa 32 ký tự' },
                    })}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message?.toString() ?? ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => togglePasswordVisibility('newPassword')}
                                    edge="end"
                                >
                                    <Iconify
                                        icon={showPassword.newPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    variant="standard"
                    label="Xác nhận mật khẩu mới"
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    {...register('confirmPassword', {
                        required: 'Vui lòng xác nhận mật khẩu',
                        validate: (value) => value === newPassword || 'Mật khẩu xác nhận không khớp',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message?.toString() ?? ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    edge="end"
                                >
                                    <Iconify
                                        icon={showPassword.confirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
                    <Button variant="outlined" color="inherit" onClick={() => reset()}>
                        Đặt lại
                    </Button>
                    <Button variant="contained" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Đổi mật khẩu'}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}
