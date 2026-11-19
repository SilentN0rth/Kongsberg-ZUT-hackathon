import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`devices\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`sector\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`serial\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_sector_idx\` ON \`devices\` (\`sector\`);`)
  await db.run(sql`CREATE INDEX \`devices_updated_at_idx\` ON \`devices\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`devices_created_at_idx\` ON \`devices\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`reports\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`device_id\` text NOT NULL,
  	\`symptom\` text NOT NULL,
  	\`priority\` text NOT NULL,
  	\`status\` text DEFAULT 'NEW' NOT NULL,
  	\`note\` text,
  	\`reported_at\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`device_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`reports_device_idx\` ON \`reports\` (\`device_id\`);`)
  await db.run(sql`CREATE INDEX \`reports_priority_idx\` ON \`reports\` (\`priority\`);`)
  await db.run(sql`CREATE INDEX \`reports_status_idx\` ON \`reports\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`reports_reported_at_idx\` ON \`reports\` (\`reported_at\`);`)
  await db.run(sql`CREATE INDEX \`reports_updated_at_idx\` ON \`reports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`reports_created_at_idx\` ON \`reports\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`queue\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`client_id\` text NOT NULL,
  	\`kind\` text DEFAULT 'report' NOT NULL,
  	\`payload\` text NOT NULL,
  	\`status\` text DEFAULT 'PENDING' NOT NULL,
  	\`attempts\` numeric DEFAULT 0,
  	\`last_error\` text,
  	\`processed_at\` text,
  	\`report_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`report_id\`) REFERENCES \`reports\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`queue_client_id_idx\` ON \`queue\` (\`client_id\`);`)
  await db.run(sql`CREATE INDEX \`queue_status_idx\` ON \`queue\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`queue_report_idx\` ON \`queue\` (\`report_id\`);`)
  await db.run(sql`CREATE INDEX \`queue_updated_at_idx\` ON \`queue\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`queue_created_at_idx\` ON \`queue\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`handovers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`brief_text\` text NOT NULL,
  	\`taken_over_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`handovers_updated_at_idx\` ON \`handovers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`handovers_created_at_idx\` ON \`handovers\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`devices_id\` text,
  	\`reports_id\` text,
  	\`queue_id\` integer,
  	\`handovers_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`devices_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`reports_id\`) REFERENCES \`reports\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`queue_id\`) REFERENCES \`queue\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`handovers_id\`) REFERENCES \`handovers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_devices_id_idx\` ON \`payload_locked_documents_rels\` (\`devices_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_reports_id_idx\` ON \`payload_locked_documents_rels\` (\`reports_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_queue_id_idx\` ON \`payload_locked_documents_rels\` (\`queue_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_handovers_id_idx\` ON \`payload_locked_documents_rels\` (\`handovers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`devices\`;`)
  await db.run(sql`DROP TABLE \`reports\`;`)
  await db.run(sql`DROP TABLE \`queue\`;`)
  await db.run(sql`DROP TABLE \`handovers\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
}
