import { useState, useCallback, useEffect } from 'react';

import { Box, Card, Tab, Tabs } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import AccountSettingsForm from 'src/sections/profile/components/AccountSettingsForm';
import SecuritySettingsForm from 'src/sections/profile/components/SecuritySettingsForm';

type TabValue = 'account' | 'security';

export default function ProfileView() {
    const router = useRouter();
    const pathname = usePathname();

    const [currentTab, setCurrentTab] = useState<TabValue>('account');

    useEffect(() => {
        if (pathname.includes('/bao-mat')) {
            setCurrentTab('security');
        } else {
            setCurrentTab('account');
        }
    }, [pathname]);

    const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: TabValue) => {
        if (newValue === 'account') {
            router.push(paths.dashboard.settings.account);
        } else {
            router.push(paths.dashboard.settings.security);
        }
    }, [router]);

    return (
        <Box sx={{ mb: 3 }}>
            <Card>
                <Tabs
                    value={currentTab}
                    onChange={handleChangeTab}
                    sx={{
                        px: 3,
                        boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.vars.palette.divider}`,
                    }}
                >
                    <Tab label="Thông tin tài khoản" value="account" />
                    <Tab label="Đổi mật khẩu" value="security" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {currentTab === 'account' && <AccountSettingsForm />}
                    {currentTab === 'security' && <SecuritySettingsForm />}
                </Box>
            </Card>
        </Box>
    );
}
