import * as Generator from 'yeoman-generator';
import yosay = require('yosay');
import { red, green } from 'colors/safe';
import * as _ from 'lodash';
import * as fse from 'fs-extra';
import { run } from '../cmd';

const TYPESCRIPT_NAPI_TEMPLATE_REPO =
  'https://github.com/kuyoonjo/typescript-napi-template.git';
const TYPESCRIPT_MODULE_TEMPLATE_REPO =
  'https://github.com/kuyoonjo/typescript-module-template.git';

export = class extends Generator {
  private answers!: Record<string, any>;
  constructor(args: string | string[], options: any) {
    super(args, options);
  }

  public initializing() {
    this.log(yosay(`Welcome to the ${red('Typescript Module')} generator.`));
  }

  public async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name',
        default: _.kebabCase(this.appname), // Default to current dir name
      },
      {
        type: 'input',
        name: 'repository',
        message: 'Repository',
        default: '',
      },
      {
        type: 'confirm',
        name: 'napi',
        message: `Would you like to use ${red('Napi')}`,
        default: false,
      },
    ]);
  }

  public async writing() {
    const cwd = this.destinationPath();
    const repo = this.answers.napi
      ? TYPESCRIPT_NAPI_TEMPLATE_REPO
      : TYPESCRIPT_MODULE_TEMPLATE_REPO;

    // clone git repo
    await run(`git clone ${repo} .`, {
      cwd,
      stdio: 'inherit',
    });

    // rm .git
    await fse.remove(`${cwd}/.git`);

    // replace project info
    const packageJsonPath = `${cwd}/package.json`;
    const project = require(packageJsonPath);
    project.name = this.answers.name;
    project.repository = this.answers.repository;
    await fse.writeFile(packageJsonPath, JSON.stringify(project, null, 2));

    if (project.repository) {
      await run(`git init`, {
        cwd,
        stdio: 'inherit',
      });
      await run(`git remote add origin ${project.repository}`, {
        cwd,
        stdio: 'inherit',
      });
    }
  }

  public async install() {
    const answers = await this.prompt([
      {
        type: 'confirm',
        name: 'install',
        message: `Would you like to install node dependencies via ${red(
          'npm install'
        )}`,
        default: true,
      },
    ]);

    if (answers.install) {
      this.npmInstall();
    }
  }

  public end() {
    this.log(green('Your project has been created. Good luck!'));
  }
};
