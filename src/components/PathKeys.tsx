type Props = {
  path: string[];
  size?: 'sm' | 'md' | 'lg';
};

// シグネチャーUI: 設定導線をキーキャップの連なりで表示
export default function PathKeys({ path, size = 'md' }: Props) {
  if (!path.length) return null;
  const cls = size === 'lg' ? 'pathkey--lg' : size === 'sm' ? 'pathkey--sm' : '';
  return (
    <span className="pathkeys">
      {path.map((seg, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="pathsep">▸</span>}
          <span className={`pathkey ${cls} ${i === path.length - 1 ? 'pathkey--last' : ''}`}>
            {seg}
          </span>
        </span>
      ))}
    </span>
  );
}
