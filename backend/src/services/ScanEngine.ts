export class ScanEngine {
  async analyzeScanData(helperData: any) {
    const results = {
      overallResult: 'CLEAN',
      detections: [],
      suspiciousModules: [],
      hiddenFiles: [],
      cosmeticMods: [],
      timestamp: new Date(),
    };

    // Filter out cosmetic modifications
    const cosmeticExtensions = ['.txd', '.dff', '.col', '.ide', '.timecyc', '.gxt'];

    if (helperData) {
      // Analyze file collections
      if (helperData.files) {
        for (const file of helperData.files) {
          const ext = this.getExtension(file.name);
          
          if (cosmeticExtensions.includes(ext)) {
            results.cosmeticMods.push({
              name: file.name,
              type: ext,
              ignored: true,
            });
          }
        }
      }
    }

    return results;
  }

  private getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
  }
}
