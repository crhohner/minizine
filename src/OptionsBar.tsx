function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M11 2a1 1 0 10-2 0v7.74L5.173 6.26a1 1 0 10-1.346 1.48l5.5 5a1 1 0 001.346 0l5.5-5a1 1 0 00-1.346-1.48L11 9.74V2zm-7.895 9.204A1 1 0 001.5 12v3.867a2.018 2.018 0 002.227 2.002c1.424-.147 3.96-.369 6.273-.369 2.386 0 5.248.236 6.795.383a2.013 2.013 0 002.205-2V12a1 1 0 10-2 0v3.884l-13.895-4.68zm0 0L2.5 11l.605.204zm0 0l13.892 4.683a.019.019 0 01-.007.005h-.006c-1.558-.148-4.499-.392-6.984-.392-2.416 0-5.034.23-6.478.38h-.009a.026.026 0 01-.013-.011V12a.998.998 0 00-.394-.796z"
      />
    </svg>
  );
}

function OptionsBar({
  filename,
  onFilenameChange,
  onDownload,
}: {
  filename: string;
  onFilenameChange: (filename: string) => void;
  onDownload: () => void;
}) {
  return (
    <div className="options-bar">
      <input
        type="text"
        className="options-bar-filename"
        value={filename}
        onChange={(event) => onFilenameChange(event.target.value)}
        aria-label="PDF filename"
      />
      <button
        type="button"
        className="options-bar-download"
        onClick={onDownload}
        aria-label="Download print layout as PDF"
      >
        <DownloadIcon />
      </button>
    </div>
  );
}

export default OptionsBar;
