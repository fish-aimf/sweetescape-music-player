// karaoke-encoder.js - URL encoding/decoding for karaoke data
const KaraokeEncoder = {
  encode(videoId, lines) {
    const sorted = [...lines].sort((a, b) => a.time - b.time);
    const parts = [];
    parts.push(videoId);
    parts.push('|');
    let lastTime = 0;
    const timestamps = [];
    for (const line of sorted) {
      const timeMs = Math.round(line.time * 1000);
      const delta = timeMs - lastTime;
      timestamps.push(this._encodeVarInt(delta));
      lastTime = timeMs;
    }
    parts.push(timestamps.join('~'));
    parts.push('|');
    const lyrics = sorted.map(line =>
      line.text
        .replace(/\|/g, '¦')
        .replace(/~/g, '～')
    ).join('|');
    parts.push(lyrics);
    const canonical = parts.join('');
    const utf8 = new TextEncoder().encode(canonical);
    const compressed = pako.deflate(utf8, {
      level: 9,
      windowBits: 15,
      memLevel: 9,
      strategy: 0
    });
    return this._toBase64URL(compressed);
  },
  
  decode(encoded) {
    try {
      const compressed = this._fromBase64URL(encoded);
      const utf8 = pako.inflate(compressed);
      const canonical = new TextDecoder().decode(utf8);
      const firstPipe = canonical.indexOf('|');
      const secondPipe = canonical.indexOf('|', firstPipe + 1);
      const videoId = canonical.substring(0, firstPipe);
      const timestampsPart = canonical.substring(firstPipe + 1, secondPipe);
      const lyricsPart = canonical.substring(secondPipe + 1);
      const deltas = timestampsPart.split('~').map(s => this._decodeVarInt(s));
      const timestamps = [];
      let accumulated = 0;
      for (const delta of deltas) {
        accumulated += delta;
        timestamps.push(accumulated / 1000);
      }
      const lyricsArray = lyricsPart.split('|').map(text =>
        text.replace(/¦/g, '|').replace(/～/g, '~')
      );
      const lines = lyricsArray.map((text, i) => ({
        text,
        time: timestamps[i]
      }));
      return { videoId, lines };
    } catch (error) {
      throw new Error('Invalid karaoke URL - corrupted or malformed data');
    }
  },
  
  _encodeVarInt(num) {
    if (num === 0) return '0';
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    let n = num;
    while (n > 0) {
      result = chars[n % 62] + result;
      n = Math.floor(n / 62);
    }
    return result;
  },
  
  _decodeVarInt(str) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const value = chars.indexOf(str[i]);
      result = result * 62 + value;
    }
    return result;
  },
  
  _toBase64URL(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  },
  
  _fromBase64URL(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },
  
  generateURL(videoId, lines) {
    const encoded = this.encode(videoId, lines);
    return `${window.location.origin}/karaoke/${encoded}`;
  },
  
  getFromURL() {
    const path = window.location.pathname;
    const karaokeMatch = path.match(/^\/karaoke\/(.+)$/);
    if (!karaokeMatch) return null;
    const encoded = karaokeMatch[1];
    return this.decode(encoded);
  },
  
  estimateSize(videoId, lines) {
    const encoded = this.encode(videoId, lines);
    return {
      encodedLength: encoded.length,
      estimatedBytes: Math.ceil(encoded.length * 3 / 4),
      url: `${window.location.origin}/karaoke/${encoded}`,
      urlLength: `${window.location.origin}/karaoke/${encoded}`.length
    };
  },
  
  // Convert karaoke lines to sweetescape lyrics format
  convertToSweetescapeLyrics(lines) {
    return lines
      .map(line => `${line.text} [${this._formatTime(line.time)}]`)
      .join('\n');
  },
  
  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KaraokeEncoder;
}
