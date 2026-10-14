-- Execute em ambientes com synchronize=false (produção).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NULL,
  name varchar(100) NOT NULL,
  email varchar(254) NOT NULL,
  subject varchar(150) NOT NULL,
  message text NOT NULL,
  source varchar(30) NOT NULL DEFAULT 'PUBLIC_SITE',
  status varchar(30) NOT NULL DEFAULT 'OPEN',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_user_created
  ON contact_messages ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON contact_messages (status, "createdAt" DESC);
