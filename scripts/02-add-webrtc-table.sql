-- Add WebRTC signaling table for peer-to-peer calling
CREATE TABLE IF NOT EXISTS webrtc_signals (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  signal_data TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webrtc_recipient ON webrtc_signals(recipient);
CREATE INDEX IF NOT EXISTS idx_webrtc_created_at ON webrtc_signals(created_at);
