export function getHostedVideoEmbedUrl(value: string, startAt = 0): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    let embed: URL;

    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      const videoId = url.pathname.startsWith("/embed/")
        ? url.pathname.split("/")[2]
        : url.pathname.startsWith("/shorts/")
          ? url.pathname.split("/")[2]
          : url.pathname.startsWith("/live/")
            ? url.pathname.split("/")[2]
            : url.searchParams.get("v");
      if (!videoId || !/^[\w-]{6,}$/.test(videoId)) return null;
      embed = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
      if (startAt > 0) embed.searchParams.set("start", String(Math.floor(startAt)));
      return embed.toString();
    }

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      if (!videoId || !/^[\w-]{6,}$/.test(videoId)) return null;
      embed = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
      if (startAt > 0) embed.searchParams.set("start", String(Math.floor(startAt)));
      return embed.toString();
    }

    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      if (!videoId || !/^\d+$/.test(videoId)) return null;
      const vimeo = new URL(`https://player.vimeo.com/video/${videoId}`);
      if (startAt > 0) vimeo.hash = `t=${Math.floor(startAt)}s`;
      return vimeo.toString();
    }

    if (["wistia.com", "www.wistia.com", "fast.wistia.net"].includes(host)) {
      const mediaId = url.pathname.split("/").filter(Boolean).pop();
      if (!mediaId || !/^[\w-]+$/.test(mediaId)) return null;
      const wistia = new URL(`https://fast.wistia.net/embed/iframe/${mediaId}`);
      if (startAt > 0) wistia.searchParams.set("time", String(Math.floor(startAt)));
      return wistia.toString();
    }
  } catch {
    return null;
  }
  return null;
}
