// Writes a full data export to a JSON file in the cache directory and opens
// the OS share sheet so the user can save/send it (GDPR "download my data").

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportAllData } from '../db/backup';
import { dayKey } from './dates';

// Builds the export file and presents the share sheet. Resolves once the sheet
// is dismissed; throws if sharing is unavailable on the device.
export async function shareDataExport(): Promise<void> {
  const data = exportAllData();
  const file = new File(Paths.cache, `macromate-export-${dayKey()}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(data, null, 2));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export NutriTrack data',
    UTI: 'public.json',
  });
}
