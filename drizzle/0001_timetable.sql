CREATE TABLE `enrolments` (
	`student_id` integer NOT NULL,
	`course_code` text NOT NULL,
	PRIMARY KEY(`student_id`, `course_code`),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lab_choices` (
	`student_id` integer NOT NULL,
	`course_code` text NOT NULL,
	`activity_id` text NOT NULL,
	PRIMARY KEY(`student_id`, `course_code`),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
