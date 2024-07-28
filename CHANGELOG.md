# Change Log

## 3.1.2
- Optional markdown summary report
- Bug fix: proper error message when request fails due to network

# [3.1.1]
- Failed

## 3.1.0
- Fix variable file sorting using explicit `sort()`
- Summarize bundle results in a table
- Use zzAPI v2.0.0 with various improvements

## [3.0.1]
- Fix regression (status checks not reported)

## [3.0.0]
- Alternate console presentation for better output
- New major version since the default output formatting has changed

## [2.2.0]
- Using v1.5.0 of zzAPI, which adds `$skip` for tests.

## [2.1.0]
- Support multiple bundles for execution

## [2.0.0]
- Using v1.4.0 of zzapi, which adds `$tests` key to the assertion operators to run tests recursively on a sub-object
- Output formatting changed: Indents the results for assertions under `$tests`

## [1.1.1]
- Using v1.2.1 of zzapi, which fixes the stopOnFailure bug

## [1.1.0]
- Using v1.2.0 of zzapi, which adds the following
  - Support for `$sw`, `$ew`, `$co` (startsWith, endsWith, contains) comparisons
  - Support for non-equal comparisons for array/string `$size`
  - Option for stopping further tests when status test fails

## [1.0.0]
- Initial release