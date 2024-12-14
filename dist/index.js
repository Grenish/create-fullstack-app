#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import path from "path";
// Utility to log messages with consistent formatting
const log = {
    info: (message) => console.log(chalk.blueBright(`[INFO]: ${message}`)),
    success: (message) => console.log(chalk.green(`[SUCCESS]: ${message}`)),
    warning: (message) => console.log(chalk.yellow(`[WARNING]: ${message}`)),
    error: (message) => console.log(chalk.red(`[ERROR]: ${message}`)),
};
// Function to create a folder
function createFolder(location, projectName) {
    const fullPath = path.join(location, projectName);
    if (fs.existsSync(fullPath)) {
        log.warning(`Directory already exists: ${fullPath}`);
    }
    else {
        try {
            fs.mkdirSync(fullPath, { recursive: true });
            log.success(`Folder created successfully at: ${fullPath}`);
        }
        catch (error) {
            log.error(`Failed to create folder: ${error.message}`);
        }
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
                choices: ["Vite React", "Next.js (TypeScript)", "Next.js (JavaScript)"],
            },
            {
                type: "list",
                name: "backend",
                message: "Select a backend framework:",
                choices: ["Node.js", "Next.js"],
            },
            {
                type: "list",
                name: "database",
                message: "Select a database:",
                choices: ["Firebase", "MongoDB"],
            },
            {
                type: "list",
                name: "auth",
                message: "Select auhtentication:",
                choices: ["Firebase", "Clerk"],
            },
            {
                type: "input",
                name: "projectName",
                message: "Enter the directory name for your project:",
                validate: (input) => input.trim().length > 0
                    ? true
                    : "Directory name cannot be empty. Please provide a valid name.",
            },
            {
                type: "input",
                name: "location",
                message: "Specify the location path where the project will be created:",
                validate: (input) => input.trim().length > 0
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
        // Step 4: Handle user confirmation
        if (confirmSetup) {
            log.info("Initializing project setup. Please wait...");
            // Step 5: Create the folder
            createFolder(answers.location, answers.projectName);
            // Add your project setup logic here
            log.success("Project setup completed successfully!");
        }
        else {
            log.warning("Setup canceled by the user.");
        }
    }
    catch (err) {
        log.error(`An unexpected error occurred: ${err.message}`);
    }
}
// Run the CLI
runCLI();
