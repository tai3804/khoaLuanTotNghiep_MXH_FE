import { useEffect } from 'react';

import { OverviewAppView } from 'src/sections/overview/app/view';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {
    useEffect(() => {
        document.title = 'Tổng quan';
    }, []);

    return <OverviewAppView />;
}
