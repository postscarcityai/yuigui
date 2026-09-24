// Download links for one marketing video (SOC-3): both cuts and their posters, with sizes.
const CUTS = [["9x16", "9:16", "Reels, TikTok, Shorts"], ["16x9", "16:9", "YouTube, X, slides"]];

export default function VideoDownloads({ v }) {
  return (
    <ul className="pk-downloads">
      {CUTS.map(([tag, ratio, use]) => (
        <li key={tag}>
          <span>{ratio} for {use}. {Math.round(v[tag].seconds)} s, {v[tag].mb} MB</span>
          <a href={v[tag].src} download>MP4 {ratio}</a>
          <a href={v[tag].poster} download>Poster {ratio}</a>
        </li>
      ))}
    </ul>
  );
}
