import * as migration_20261119_132849_initial from './20261119_132849_initial';
import * as migration_20261119_141248_admin_name_required from './20261119_141248_admin_name_required';
import * as migration_20261119_144238_settings_global from './20261119_144238_settings_global';

export const migrations = [
  {
    up: migration_20261119_132849_initial.up,
    down: migration_20261119_132849_initial.down,
    name: '20261119_132849_initial',
  },
  {
    up: migration_20261119_141248_admin_name_required.up,
    down: migration_20261119_141248_admin_name_required.down,
    name: '20261119_141248_admin_name_required',
  },
  {
    up: migration_20261119_144238_settings_global.up,
    down: migration_20261119_144238_settings_global.down,
    name: '20261119_144238_settings_global'
  },
];
