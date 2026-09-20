CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`confirmed` integer DEFAULT false NOT NULL,
	`confirm_token` text,
	`unsubscribe_token` text NOT NULL,
	`subscribed_at` integer NOT NULL,
	`confirmed_at` integer,
	`unsubscribed_at` integer,
	`source` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_unsubscribe_token_unique` ON `subscribers` (`unsubscribe_token`);