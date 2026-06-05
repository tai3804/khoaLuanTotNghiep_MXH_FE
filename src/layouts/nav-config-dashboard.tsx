import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';
import { Iconify } from 'src/components/iconify';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  category: <Iconify icon="nrk:category-active" width={20} />,
  settings: <Iconify icon="mdi:cog" width={20} />,
  purchase: <Iconify icon="bx:purchase-tag" width={20} />,
  warehouse: <Iconify icon="mdi:warehouse" width={20} />,
  sales: <Iconify icon="mdi:sale" width={20} />,
  internal: <Iconify icon="solar:wallet-money-bold" width={20} />,
};

export const navData = [
  {
    items: [{ title: 'Tổng quan', path: paths.dashboard.root, icon: ICONS.dashboard }],
  },
];