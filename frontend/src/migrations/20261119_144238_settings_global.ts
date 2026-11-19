import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings_watches\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`from\` text NOT NULL,
  	\`to\` text NOT NULL,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_watches_order_idx\` ON \`settings_watches\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_watches_parent_id_idx\` ON \`settings_watches\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`vessel_name\` text DEFAULT 'Statek' NOT NULL,
  	\`timezone\` text DEFAULT 'Europe/Warsaw' NOT NULL,
  	\`brief_header\` text DEFAULT 'HANDOVER BRIEF' NOT NULL,
  	\`live_refresh_seconds\` numeric DEFAULT 3 NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings_watches\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
}
