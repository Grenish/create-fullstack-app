#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { simpleGit } from 'simple-git';
import { z } from 'zod';

// Get project name from command line arguments
const projectName = process.argv[2];

// Configuration Types and Schemas
const ConfigSchema = z.object({
    frontend: z.enum(['Next.js (TypeScript)']),
    backend: z.enum(['Next.js']),
    database: z.enum(['Firebase']),
    auth: z.enum(['Firebase']),
    projectName: z.string().min(1, 'Project name cannot be empty'),
    location: z.string().min(1, 'Location path cannot be empty')
});

type ProjectConfig = z.infer<typeof ConfigSchema>;

// Logging Utility
class Logger {
    private static formatMessage(level: string, message: string): string {
        return message;
    }

    static info(message: string): void {
        console.log(chalk.blue('ℹ ') + chalk.whiteBright(this.formatMessage('info', message)));
    }

    static success(message: string): void {
        console.log(chalk.green('✔ ') + chalk.whiteBright(this.formatMessage('success', message)));
    }

    static warning(message: string): void {
        console.log(chalk.yellow('⚠ ') + chalk.whiteBright(this.formatMessage('warning', message)));
    }

    static error(message: string): void {
        console.error(chalk.red('✖ ') + chalk.whiteBright(this.formatMessage('error', message)));
    }
}

// Project Creation Utilities
class ProjectSetup {
    static createProjectFolder(location: string, projectName: string): string {
        const fullPath = path.resolve(location, projectName);

        try {
            if (fs.existsSync(fullPath)) {
                Logger.warning(`Directory already exists: ${fullPath}`);
            } else {
                fs.mkdirSync(fullPath, { recursive: true });
                Logger.success(`Project folder created: ${fullPath}`);
            }

            return fullPath;
        } catch (error) {
            Logger.error(`Failed to create project folder: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    static async cloneRepository(repoUrl: string, targetDir: string): Promise<void> {
        try {
            // Spinning animation while cloning
            const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
            let i = 0;

            const spinner = setInterval(() => {
                process.stdout.write(`\r${chalk.blue(frames[i])} Creating your project...`);
                i = (i + 1) % frames.length;
            }, 80);

            const git = simpleGit();
            await git.clone(repoUrl, targetDir);

            // Clear spinner and show success message
            clearInterval(spinner);
            process.stdout.write('\r'); // Clear the current line
            Logger.success(`Project created successfully: ${path.basename(targetDir)}`);
        } catch (error) {
            Logger.error(`Repository cloning failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

}

// CLI Interaction and Main Workflow
class ProjectCLI {
    static async getProjectConfiguration(): Promise<ProjectConfig> {
        // If no project name is provided via CLI
        if (!projectName) {
            Logger.error('Please provide a project name: npx create-fullstack-app <project-name>');
            process.exit(1);
        }

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'frontend',
                message: 'Select frontend framework:',
                choices: ['Next.js (TypeScript)']
            },
            {
                type: 'list',
                name: 'backend',
                message: 'Select backend framework:',
                choices: ['Next.js']
            },
            {
                type: 'list',
                name: 'database',
                message: 'Select database:',
                choices: ['Firebase']
            },
            {
                type: 'list',
                name: 'auth',
                message: 'Select authentication:',
                choices: ['Firebase']
            },
            {
                type: 'input',
                name: 'location',
                message: 'Specify project location path:',
                default: process.cwd(),
                validate: (input) => input.trim().length > 0 || 'Location path cannot be empty'
            }
        ]);

        const config = {
            ...answers,
            projectName: projectName
        };

        try {
            return ConfigSchema.parse(config);
        } catch (error) {
            Logger.error('Invalid project configuration');
            throw error;
        }
    }

    static displayConfigSummary(config: ProjectConfig): void {
        console.log(chalk.bold('\n📋 Project Configuration Summary'));
        console.log(chalk.gray('─'.repeat(40)));
        Object.entries(config).forEach(([key, value]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            console.log(chalk.blue(`${formattedKey}:`), chalk.white(value));
        });
        console.log(chalk.gray('─'.repeat(40)) + '\n');
    }

    static async run(): Promise<void> {
        try {
            Logger.info('Welcome to the Full-Stack Project CLI Tool! 🚀');

            const config = await this.getProjectConfiguration();
            this.displayConfigSummary(config);

            const { confirmSetup } = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirmSetup',
                message: 'Proceed with these settings?',
                default: true
            }]);

            if (!confirmSetup) {
                Logger.warning('Project setup canceled by user.');
                return;
            }

            const projectPath = ProjectSetup.createProjectFolder(config.location, config.projectName);
            const repoUrl = 'https://github.com/Fi-Nitex/next-firebase';
            await ProjectSetup.cloneRepository(repoUrl, projectPath);

            console.log(`
${chalk.green('✨ Project successfully initialized!')}
${chalk.bold('\n📝 Next Steps:')}
${chalk.gray('─'.repeat(40))}
${chalk.blue('1.')} Navigate to project:     ${chalk.white(`cd ${path.basename(projectPath)}`)}
${chalk.blue('2.')} Install dependencies:    ${chalk.white('bun install')}
${chalk.blue('3.')} Start development:       ${chalk.white('bun run dev')}
${chalk.gray('─'.repeat(40))}
`);

        } catch (error) {
            Logger.error(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    }
}

// Execute CLI
ProjectCLI.run().catch(error => {
    Logger.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
