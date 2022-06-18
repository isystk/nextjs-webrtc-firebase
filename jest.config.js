/**
 * Jest Configuration
 */
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { readFileSync } = require('fs')
const { parse } = require('jsonc-parser')
// extendsを自動的に解決してマージできないため、compilerOptions.pathsを書いているファイルを指定する
const { compilerOptions } = parse(readFileSync('./tsconfig.json').toString())
const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>/',
})

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper,
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.jest.json',
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
