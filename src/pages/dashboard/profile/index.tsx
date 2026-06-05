import { useEffect } from 'react';

import { DashboardContent } from 'src/layouts/dashboard';

import ProfileView from 'src/sections/profile/view/profile-view';

export default function ProfilePage() {
    useEffect(() => {
        document.title = 'Cài đặt - Hồ sơ';
    }, []);

    return (
        <DashboardContent maxWidth="lg">
            <ProfileView />
        </DashboardContent>
    );
}
