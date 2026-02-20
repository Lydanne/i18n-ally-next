/* eslint-disable no-console */
import { join, resolve } from 'path'
import { runTests } from '@vscode/test-electron'
import chalk from 'chalk'
import fg from 'fast-glob'
import fs from 'fs-extra'

const args = process.argv.slice(2)

async function main() {
  const root = resolve(__dirname, '../..')
  const extensionDevelopmentPath = root

  // Frameworks
  const testFrameworksDir = join(root, 'test/e2e-out/frameworks')
  const testFixturesDir = join(root, 'test/e2e-out/fixtures')
  const fixtureTempPath = join(root, 'test/e2e-fixtures-temp')

  if (fs.existsSync(fixtureTempPath))
    await fs.remove(fixtureTempPath)

  const frameworks = args.length
    ? args.filter(a => !a.startsWith('issue-'))
    : await fg('*', { onlyDirectories: true, cwd: testFrameworksDir })

  const fixtures = args.length
    ? args.filter(a => a.startsWith('issue-'))
    : await fg('*', { onlyDirectories: true, cwd: testFixturesDir })

  try {
    // Run framework tests
    for (const framework of frameworks) {
      console.log(`\n\n${chalk.blue('Start E2E testing for framework')} ${chalk.magenta(framework)} ${chalk.blue('...\n')}`)
      const extensionTestsPath = join(testFrameworksDir, framework, 'index')
      const fixtureSourcePath = join(root, 'examples/by-frameworks', framework)
      const fixtureTargetPath = join(fixtureTempPath, framework)

      await fs.copy(fixtureSourcePath, fixtureTargetPath)

      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath,
        version: '1.106.0',
        launchArgs: [fixtureTargetPath, '--disable-extensions'],
      })

      console.log(chalk.green(`E2E tests for framework ${framework} finished.\n`))
    }

    // Run fixture tests
    for (const fixture of fixtures) {
      console.log(`\n\n${chalk.blue('Start E2E testing for fixture')} ${chalk.magenta(fixture)} ${chalk.blue('...\n')}`)
      const extensionTestsPath = join(testFixturesDir, fixture, 'index')
      const fixtureSourcePath = join(root, 'examples/by-fixtures', fixture)
      const fixtureTargetPath = join(fixtureTempPath, fixture)

      await fs.copy(fixtureSourcePath, fixtureTargetPath)

      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath,
        version: '1.106.0',
        launchArgs: [fixtureTargetPath, '--disable-extensions'],
      })

      console.log(chalk.green(`E2E tests for fixture ${fixture} finished.\n`))
    }

    process.exit(0)
  }
  catch (err) {
    console.error('Failed to run tests')
    console.error(err)
    process.exit(1)
  }
}

main()
