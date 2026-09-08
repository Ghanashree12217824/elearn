CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(45),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lesson_id` int,
	`type` varchar(45),
	`title` varchar(45),
	`body` varchar(45),
	`position` int,
	CONSTRAINT `contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollment` (
	`course_id` int,
	`user_id` int,
	`id` varchar(45),
	`enrolled_at` date,
	`status` enum('active','completed','cancelled')
);
--> statement-breakpoint
CREATE TABLE `instructor_profile` (
	`user_id` int NOT NULL,
	`qualification` varchar(45),
	`specialization` varchar(45),
	`joined_at` datetime,
	`experienced_years` int,
	`bio` varchar(45),
	CONSTRAINT `instructor_profile_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `lesson` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(45),
	`module_id` int,
	CONSTRAINT `lesson_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(45),
	`description` varchar(45),
	`course_id` int,
	CONSTRAINT `modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_text` varchar(45),
	`quiz_id` int,
	`marks` varchar(45),
	`position` varchar(45),
	`created_at` varchar(45),
	`updated_at` varchar(45),
	`option_text` json,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(45),
	`module_id` int,
	`total_marks` varchar(45),
	`total_minutes` varchar(45),
	CONSTRAINT `quiz_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profile` (
	`user_id` int NOT NULL,
	`bio` varchar(45),
	`education` varchar(45),
	`dob` date,
	`joined_at` datetime,
	CONSTRAINT `student_profile_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `submission` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int,
	`question_id` int,
	`user_id` int,
	CONSTRAINT `submission_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `name` TO `first_name`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `email` TO `gmail`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `password` TO `password_hash`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `courses` DROP FOREIGN KEY `courses_instructor_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `courses` MODIFY COLUMN `title` varchar(45);--> statement-breakpoint
ALTER TABLE `courses` MODIFY COLUMN `description` varchar(45);--> statement-breakpoint
ALTER TABLE `courses` MODIFY COLUMN `instructor_id` int;--> statement-breakpoint
ALTER TABLE `courses` MODIFY COLUMN `created_at` datetime;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `first_name` varchar(45);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `gmail` varchar(45);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password_hash` varchar(45);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('student','instructor','admin');--> statement-breakpoint
ALTER TABLE `courses` ADD `slug` varchar(45);--> statement-breakpoint
ALTER TABLE `courses` ADD `category_id` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `updated_at` varchar(45);--> statement-breakpoint
ALTER TABLE `courses` ADD `level` enum('beginner','intermediate','advanced');--> statement-breakpoint
ALTER TABLE `courses` ADD `status` enum('draft','published');--> statement-breakpoint
ALTER TABLE `courses` ADD `price` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `published_at` date;--> statement-breakpoint
ALTER TABLE `users` ADD `last_name` varchar(45);--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(45);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `created_at`;