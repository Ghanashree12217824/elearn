ALTER TABLE `users` MODIFY COLUMN `role` enum('student','instructor','admin') NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `instructor_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_instructor_id_users_id_fk` FOREIGN KEY (`instructor_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` DROP COLUMN `updated_at`;