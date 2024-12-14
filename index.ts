#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { simpleGit } from "simple-git";

// Utility to log messages with consistent formatting
const log = {
    info: (message: string) => console.log(chalk.blueBright(`[INFO]: ${message}`)),
    success: (message: string) => console.log(chalk.green(`[SUCCESS]: ${message}`)),
    warning: (message: string) => console.log(chalk.yellow(`[WARNING]: ${message}`)),
    error: (message: string) => console.log(chalk.red(`[ERROR]: ${message}`)),
};

// Function to create a folder
function createFolder(location: string, projectName: string): string {
    const fullPath = path.join(location, projectName);

    if (fs.existsSync(fullPath)) {
        log.warning(`Directory already exists: ${fullPath}`);
    } else {
        try {
            fs.mkdirSync(fullPath, { recursive: true });
            log.success(`Folder created successfully at: ${fullPath}`);
        } catch (error) {
            log.error(`Failed to create folder: ${(error as Error).message}`);
        }
    }

    return fullPath;
}

// Function to clone a repository
async function cloneRepository(repoUrl: string, targetDir: string) {
    const git = simpleGit();
    try {
        log.info(`Cloning repository from ${repoUrl} to ${targetDir}...`);
        await git.clone(repoUrl, targetDir);
        log.success(`Repository cloned successfully to: ${targetDir}`);
    } catch (error) {
        log.error(`Failed to clone repository: ${(error as Error).message}`);
        throw error;
    }
}

// Main function
async function runCLI() {
    log.info("Welcome to the Full-Stack Project CLI Tool! 🚀");
    log.info("This tool will guide you through setting up your project step by step.\n");

    try {
        // Step 1: User's preferences
        const answers = await inquirer.prompt([
            {
                type: "list",
                name: "frontend",
                message: "Select a frontend framework:",
                choices: ["Next.js (TypeScript)"],
            },
            {
                type: "list",
                name: "backend",
                message: "Select a backend framework:",
                choices: ["Next.js"],
            },
            {
                type: "list",
                name: "database",
                message: "Select a database:",
                choices: ["Firebase"],
            },
            {
                type: "list",
                name: "auth",
                message: "Select authentication:",
                choices: ["Firebase"],
            },
            {
                type: "input",
                name: "projectName",
                message: "Enter the directory name for your project:",
                validate: (input) =>
                    input.trim().length > 0
                        ? true
                        : "Directory name cannot be empty. Please provide a valid name.",
            },
            {
                type: "input",
                name: "location",
                message: "Specify the location path where the project will be created:",
                validate: (input) =>
                    input.trim().length > 0
                        ? true
                        : "Location path cannot be empty. Please provide a valid path.",
            },
        ]);

        // Summary
        console.log("\n" + chalk.bold("Summary of your choices:"));
        log.success(`Frontend Framework: ${answers.frontend}`);
        log.success(`Backend Framework: ${answers.backend}`);
        log.success(`Database: ${answers.database}`);
        log.success(`Authentication: ${answers.auth}`);
        log.success(`Project Name: ${answers.projectName}`);
        log.success(`Location Path: ${answers.location}`);
        console.log();

        // Confirmation
        const { confirmSetup } = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmSetup",
                message: "Do you want to proceed with these settings?",
                default: true,
            },
        ]);

        // User confirmation
        if (confirmSetup) {
            log.info("Initializing project setup. Please wait...");

            // Create the folder
            const projectPath = createFolder(answers.location, answers.projectName);

            // Clone the repository
            const repoUrl = "https://github.com/Fi-Nitex/next-firebase";
            await cloneRepository(repoUrl, projectPath);

            log.success("Project setup completed successfully!");
        } else {
            log.warning("Setup canceled by the user.");
        }
    } catch (err) {
        log.error(`An unexpected error occurred: ${(err as Error).message}`);
    }
}

// Run the CLI
runCLI().catch(err => log.error(`CLI execution failed: ${(err as Error).message}`));