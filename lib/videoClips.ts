// Video clips shown on the waitlist page.
// To add a clip: put the MP4 file in public/videos/ and add one entry below.
// Keep each clip short (15 to 30 seconds) and compressed (ideally under 5 MB).
// Use only videos you own or have rights to.
export type VideoClip = {
  id: string; // short and unique, letters, digits, hyphens only, e.g. 'promo-cut-1'
  title: string; // shown under the video
  src: string; // file path inside public/, e.g. '/videos/promo-cut-1.mp4'
  poster?: string; // optional still image shown before the video plays
  ratio: '16 / 9' | '9 / 16';
};

// Empty for now: the video section stays hidden until clips are added.
export const VIDEO_CLIPS: VideoClip[] = [];
