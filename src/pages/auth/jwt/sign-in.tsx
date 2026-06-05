import { CONFIG } from 'src/global-config';

import { JwtSignInView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Công ty TNHH Ngọc Đài` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <JwtSignInView />
    </>
  );
}
