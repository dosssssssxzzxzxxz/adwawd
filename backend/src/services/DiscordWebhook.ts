import axios from 'axios';

export class DiscordWebhook {
  private webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';

  async sendReport(scanId: string, playerName: string, results: any) {
    if (!this.webhookUrl) {
      console.log('[!] Discord webhook not configured');
      return;
    }

    try {
      const color = this.getColorForResult(results.overallResult);
      const emoji = this.getResultEmoji(results.overallResult);

      let description = `**Player:** ${this.escapeMarkdown(playerName)}\n`;
      description += `**Scan ID:** \`${scanId}\`\n`;
      description += `**Result:** ${emoji} **${results.overallResult}**`;

      const fields: any[] = [];

      // Detections
      if (results.detections && results.detections.length > 0) {
        let detectionsText = '';
        for (const d of results.detections) {
          detectionsText += `**${d.type}:** ${this.escapeMarkdown(d.name)}\n`;
          detectionsText += `Path: \`${this.escapeMarkdown(d.path)}\`\n`;
          detectionsText += `Severity: **${d.severity}**\n\n`;
        }
        fields.push({
          name: '🔴 Detections',
          value: detectionsText || 'None',
          inline: false,
        });
      } else {
        fields.push({
          name: '🔴 Detections',
          value: 'None',
          inline: false,
        });
      }

      // Loaded Modules
      if (results.suspiciousModules && results.suspiciousModules.length > 0) {
        let modulesText = '';
        for (const m of results.suspiciousModules) {
          modulesText += `**${this.escapeMarkdown(m.name)}**\n`;
          modulesText += `Status: ${m.status}\n`;
          modulesText += `GTA Interaction: ${m.gtaInteraction}\n\n`;
        }
        fields.push({
          name: '🧩 Loaded Modules',
          value: modulesText,
          inline: false,
        });
      } else {
        fields.push({
          name: '🧩 Loaded Modules',
          value: 'None',
          inline: false,
        });
      }

      // Hidden Files
      if (results.hiddenFiles && results.hiddenFiles.length > 0) {
        let hiddenText = '';
        for (const f of results.hiddenFiles) {
          hiddenText += `**${this.escapeMarkdown(f.name)}**\n`;
          hiddenText += `Classification: ${f.classification}\n\n`;
        }
        fields.push({
          name: '👁️ Hidden Files',
          value: hiddenText,
          inline: false,
        });
      }

      // Summary
      fields.push({
        name: '📊 Summary',
        value:
          `ASI: ${results.asiCount || 0}\n` +
          `MoonLoader: ${results.moonloaderCount || 0}\n` +
          `CLEO: ${results.cleoCount || 0}\n` +
          `Loaded Modules: ${results.loadedModules || 0}`,
        inline: false,
      });

      // Cosmetic Mods
      fields.push({
        name: '✅ Cosmetic Modifications',
        value: 'Skins, Textures, Timecyc, Vehicle Models — **Ignored**',
        inline: false,
      });

      const embed = {
        title: '🖥️ SA-MP PC CHECKER',
        description,
        color,
        fields,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SA-MP PC Checker v1.0',
        },
      };

      const payload = {
        username: 'SA-MP Checker',
        avatar_url: 'https://via.placeholder.com/50',
        embeds: [embed],
      };

      await axios.post(this.webhookUrl, payload, {
        timeout: 10000,
      });

      console.log(`[+] Discord report sent for scan ${scanId}`);
    } catch (error) {
      console.error('[ERROR] Discord webhook failed:', error);
    }
  }

  private getColorForResult(result: string): number {
    const colors: Record<string, number> = {
      CLEAN: 0x00ff00,
      UNKNOWN: 0xffaa00,
      SUSPICIOUS: 0xff6600,
      CHEAT_DETECTED: 0xff0000,
    };
    return colors[result] || 0x808080;
  }

  private getResultEmoji(result: string): string {
    const emojis: Record<string, string> = {
      CLEAN: '✅',
      UNKNOWN: '⚠️',
      SUSPICIOUS: '⚠️',
      CHEAT_DETECTED: '❌',
    };
    return emojis[result] || '❓';
  }

  private escapeMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/`/g, '\\`')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }
}
