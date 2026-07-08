export default function Wordmark({ size = '26px', color = 'var(--text)' }) {
  return (
    <span className="wordmark" style={{ fontSize: size, color }}>
      ped<span className="wordmark-i">&#305;<span className="wordmark-acc" /></span>
    </span>
  );
}
